"use client"

import { useEffect, useMemo, useState } from "react"
import type { LatLng } from "@/lib/geo"
import { createClient } from "@/utils/supabase/client"

// Uses accommodations table safety_features to approximate help points
export function useNearbyHelpPoints(origin: LatLng | null, city?: string | null, maxKm: number = 8) {
  const supabase = useMemo(() => createClient(), [])
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      let q = supabase
        .from('accommodations')
        .select('id, latitude, longitude, city, safety_features')
      if (city) q = q.eq('city', city)
      const { data, error } = await q
      if (cancelled || error || !data) return setCount(0)
      if (!origin) return setCount(0)
      const R = 6371
      const d = (a: LatLng, b: LatLng) => {
        const dLat = ((b.lat - a.lat) * Math.PI) / 180
        const dLon = ((b.lng - a.lng) * Math.PI) / 180
        const lat1 = (a.lat * Math.PI) / 180
        const lat2 = (b.lat * Math.PI) / 180
        const sinDLat = Math.sin(dLat / 2)
        const sinDLon = Math.sin(dLon / 2)
        const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon))
        return R * c
      }
      const helps = (data as any[]).filter(r => Array.isArray(r.safety_features) && r.safety_features.some((s: string) => /police|hospital|clinic|embassy/i.test(s)))
      const nearby = helps.filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number' && d(origin, { lat: r.latitude, lng: r.longitude }) <= maxKm)
      setCount(nearby.length)
    }
    load()
    return () => { cancelled = true }
  }, [supabase, origin?.lat, origin?.lng, city, maxKm])

  return count
}
