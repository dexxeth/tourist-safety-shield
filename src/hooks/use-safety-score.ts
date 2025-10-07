"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/auth"

export function useSafetyScore(): number | null {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()
  const [score, setScore] = useState<number | null>(user?.safetyScore ?? null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('safety_score')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      if (!cancelled && !error && data) setScore(Number(data.safety_score ?? 0))
    }
    load()
    if (!user?.id) return
    const channel = supabase
      .channel('profiles_safety_score')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, (payload) => {
        const next = (payload as any).new?.safety_score
        if (typeof next === 'number') setScore(next)
      })
      .subscribe()
    return () => { cancelled = true; try { supabase.removeChannel(channel) } catch {} }
  }, [supabase, user?.id])

  // also update when auth user object changes
  useEffect(() => {
    if (typeof user?.safetyScore === 'number') setScore(user.safetyScore)
  }, [user?.safetyScore])

  return score
}
