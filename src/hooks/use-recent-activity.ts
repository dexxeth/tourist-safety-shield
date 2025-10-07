"use client"

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/lib/auth'

export type ActivityItem = {
  id: string
  type: 'location' | 'alert' | 'score' | 'route'
  message: string
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
  timestamp: number
}

export function useRecentActivity() {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()
  const [feed, setFeed] = useState<ActivityItem[]>([])

  // Helper to add activities and keep top N sorted by time
  const pushActivity = (item: ActivityItem) => {
    setFeed((prev) => {
      const merged = [item, ...prev].sort((a, b) => b.timestamp - a.timestamp)
      return merged.slice(0, 20)
    })
  }

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    // Initial load: get last location, recent alerts, and profile score
    const initialLoad = async () => {
      try {
        // Latest location snapshot
        const locQ = supabase
          .from('user_locations')
          .select('area_name, city, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
        const { data: locData } = await locQ
        if (!cancelled && locData && locData[0]) {
          const area = (locData[0] as any).area_name || (locData[0] as any).city
          if (area) pushActivity({
            id: `init-loc-${(locData[0] as any).created_at}`,
            type: 'location',
            message: `Entered ${area}`,
            color: 'green',
            timestamp: Date.parse((locData[0] as any).created_at) || Date.now(),
          })
        }

        // Recent alerts in same city (last 6h)
        const now = Date.now()
        const sinceIso = new Date(now - 6 * 60 * 60 * 1000).toISOString()
        let alertsQ = supabase
          .from('safety_alerts')
          .select('id, city, valid_from, description')
          .gte('valid_from', sinceIso)
          .order('valid_from', { ascending: false })
          .limit(3)
        const { data: alertsData } = await alertsQ
        if (!cancelled && alertsData) {
          alertsData.forEach((a: any) => pushActivity({
            id: `init-alert-${a.id}`,
            type: 'alert',
            message: `New safety alert${a.city ? ` in ${a.city}` : ''}${a.description ? `: ${a.description}` : ''}`,
            color: 'red',
            timestamp: a.valid_from ? Date.parse(a.valid_from) : now,
          }))
        }

        // Current safety score
        const { data: prof } = await supabase
          .from('profiles')
          .select('safety_score, updated_at')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()
        if (!cancelled && prof && typeof (prof as any).safety_score === 'number') {
          pushActivity({
            id: `init-score-${(prof as any).updated_at || 'now'}`,
            type: 'score',
            message: `Safety score is ${(prof as any).safety_score}`,
            color: 'blue',
            timestamp: (prof as any).updated_at ? Date.parse((prof as any).updated_at) : now,
          })
        }
      } catch { /* ignore */ }
    }
    initialLoad()

    // Subscribe to live changes
    const chLocations = supabase
      .channel('live_user_locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_locations', filter: `user_id=eq.${user.id}` }, (payload) => {
        const area = (payload.new as any).area_name || (payload.new as any).city
        const msg = area ? `Moved to ${area}` : 'Location updated'
        pushActivity({ id: `loc-${payload.new.id || payload.new.created_at}`, type: 'location', message: msg, color: 'green', timestamp: Date.parse((payload.new as any).created_at) || Date.now() })
      })
      .subscribe()

    const chAlerts = supabase
      .channel('live_safety_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'safety_alerts' }, (payload) => {
        const a = payload.new as any
        pushActivity({ id: `alert-${a.id}`, type: 'alert', message: `New safety alert${a.city ? ` in ${a.city}` : ''}${a.description ? `: ${a.description}` : ''}`, color: 'red', timestamp: a.valid_from ? Date.parse(a.valid_from) : Date.now() })
      })
      .subscribe()

    const chProfiles = supabase
      .channel('live_profiles_score')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, (payload) => {
        const next = (payload.new as any).safety_score
        if (typeof next === 'number') pushActivity({ id: `score-${payload.new.user_id}-${payload.commit_timestamp}`, type: 'score', message: `Safety score updated to ${next}`, color: 'blue', timestamp: Date.parse((payload as any).commit_timestamp || '') || Date.now() })
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(chLocations) } catch {}
      try { supabase.removeChannel(chAlerts) } catch {}
      try { supabase.removeChannel(chProfiles) } catch {}
      cancelled = true
    }
  }, [supabase, user?.id])

  return feed
}
