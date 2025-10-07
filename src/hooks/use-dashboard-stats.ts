"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useUserLocation } from "@/hooks/use-user-location"
import { useNearbyDestinations } from "@/hooks/use-nearby-destinations"
import { useNearbyHelpPoints } from "@/hooks/use-nearby-help-points"

export type DashboardStats = {
  safetyScore: number
  activeAlerts: number
  safeRoutes: number
  nearbyHelp: number
  safeRouteDestinations: string[]
}

export function useDashboardStats(): DashboardStats {
  const supabase = useMemo(() => createClient(), [])
  const latestLoc = useUserLocation()
  const origin = useMemo(
    () => (latestLoc.lat != null && latestLoc.lng != null ? { lat: latestLoc.lat, lng: latestLoc.lng } : null),
    [latestLoc.lat, latestLoc.lng]
  )
  const [activeAlerts, setActiveAlerts] = useState(0)

  // Compute safe routes and nearby help from location and datasets
  const { destinations: nearbyPlaces } = useNearbyDestinations(origin, latestLoc.areaName, 8)
  const safeRoutes = nearbyPlaces.length
  const safeRouteDestinations = useMemo(() => nearbyPlaces.slice(0, 3).map((p: any) => p.name), [nearbyPlaces])

  const nearbyHelp = useNearbyHelpPoints(origin, latestLoc.areaName ?? null, 8)

  // Load and subscribe to active safety alerts (by city if available)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const city = latestLoc.areaName || undefined
  let q = supabase.from("safety_alerts").select("id, valid_from").order("valid_from", { ascending: false })
      if (city) q = q.eq("city", city)
      const { data, error } = await q
      if (cancelled) return
      if (!error && data) {
        // consider alerts in last 24h as active if no explicit end field
        const cutoff = Date.now() - 24 * 60 * 60 * 1000
        const count = data.filter((r: any) => {
          const t = r.valid_from ? Date.parse(r.valid_from) : Date.now()
          return t >= cutoff
        }).length
        setActiveAlerts(count)
      }
    }
    load()

    const city = latestLoc.areaName || undefined
    const filter = city ? `city=eq.${city}` : undefined
    const channel = supabase
      .channel("safety_alerts_changes")
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'safety_alerts', ...(filter ? { filter } : {}) },
        () => { load() }
      )
      .subscribe()

    return () => { cancelled = true; try { supabase.removeChannel(channel) } catch {} }
  }, [supabase, latestLoc.areaName])

  // Heuristic safety score derived from alerts and help availability
  const safetyScore = useMemo(() => {
    let score = 85
    if (activeAlerts > 0) score -= 10
    if (activeAlerts > 2) score -= 5
    if (safeRoutes > 3) score += 3
    if (nearbyHelp > 3) score += 4
    if (!origin) score -= 5
    return Math.max(0, Math.min(100, score))
  }, [activeAlerts, safeRoutes, nearbyHelp, origin])

  return { safetyScore, activeAlerts, safeRoutes, nearbyHelp, safeRouteDestinations }
}
