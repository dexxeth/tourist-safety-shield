"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/auth"
import { reverseGeocode } from "@/lib/geocoding"

type LatestLocation = {
  lat: number | null
  lng: number | null
  accuracy: number | null
  areaName: string | null
  updatedAt: string | null
}

export function useUserLocation(): LatestLocation {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()
  const [loc, setLoc] = useState<LatestLocation>({ lat: null, lng: null, accuracy: null, areaName: null, updatedAt: null })

  useEffect(() => {
    let isMounted = true
    
    const oneShotGeolocation = () => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) return
      navigator.geolocation.getCurrentPosition(async (pos) => {
        if (!isMounted) return
        const { latitude, longitude, accuracy } = pos.coords
        let areaName: string | null = null
        try {
          const r = await reverseGeocode(latitude, longitude)
          areaName = r.city ?? null
        } catch {}
        setLoc({ lat: latitude, lng: longitude, accuracy: accuracy ?? null, areaName, updatedAt: new Date().toISOString() })
      }, () => { /* ignore */ }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 })
    }

    // Fallback: if not logged in or no user id, try a one-shot geolocation so UI doesn't keep "Locating…"
    if (!user?.id) {
      oneShotGeolocation()
      return () => { isMounted = false }
    }

    const load = async () => {
      // First attempt: expect area_name
      let { data, error } = await supabase
        .from("user_locations")
        .select("latitude, longitude, accuracy, area_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
      if ((!data || !data[0]) || error?.code === 'PGRST204') {
        // Fallback: try selecting city if area_name doesn't exist in schema
        const fb = await supabase
          .from("user_locations")
          .select("latitude, longitude, accuracy, city, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
        data = fb.data as any
        error = fb.error as any
      }
      if (!isMounted) return
      if (!error && data && data[0]) {
        const row = data[0] as any
        setLoc({
          lat: row.latitude ?? null,
          lng: row.longitude ?? null,
          accuracy: row.accuracy ?? null,
          areaName: (row.area_name ?? row.city) ?? null,
          updatedAt: row.created_at ?? null,
        })
      } else {
        // No DB row yet for this user; fall back to one-shot geolocation
        oneShotGeolocation()
      }
    }
    load()

    const channel = supabase
      .channel("user_locations_stream")
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_locations', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = (payload as any).new
          if (!row) return
          setLoc({
            lat: row.latitude ?? null,
            lng: row.longitude ?? null,
            accuracy: row.accuracy ?? null,
            areaName: (row.area_name ?? row.city) ?? null,
            updatedAt: row.created_at ?? null,
          })
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [supabase, user?.id])

  return loc
}
