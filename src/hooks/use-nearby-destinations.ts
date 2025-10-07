"use client"

import { useEffect, useMemo, useState } from "react"
import { listNearbyAccommodations, type NearbyAccommodation } from "@/lib/data"
import type { LatLng } from "@/lib/geo"

export function useNearbyDestinations(origin: LatLng | null, city?: string | null, limit: number = 8) {
  const [destinations, setDestinations] = useState<NearbyAccommodation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const rows = await listNearbyAccommodations(origin, city ?? undefined, limit)
      if (!cancelled) setDestinations(rows)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [origin?.lat, origin?.lng, city, limit])

  return useMemo(() => ({ destinations, loading }), [destinations, loading])
}
