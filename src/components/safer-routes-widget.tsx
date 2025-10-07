"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, MapPin, Clock, Shield, Route } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useUserLocation } from "@/hooks/use-user-location"
import { haversineKm } from "@/lib/geo"
import { useNearbyDestinations } from "@/hooks/use-nearby-destinations"
import { createClient } from "@/utils/supabase/client"
import { reverseGeocode, forwardGeocode, type GeocodeResult } from "@/lib/geocoding"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
const MapView = dynamic(() => import('./map-view'), { ssr: false })

interface RouteOption {
  id: string
  name: string
  duration: string
  safetyScore: number
  distance: string
  highlights: string[]
  riskLevel: "low" | "medium" | "high"
}

export function SaferRoutesWidget() {
  const latestLoc = useUserLocation()
  const supabase = useMemo(() => createClient(), [])
  const origin = useMemo(() => (
    latestLoc.lat != null && latestLoc.lng != null ? { lat: latestLoc.lat, lng: latestLoc.lng } : null
  ), [latestLoc.lat, latestLoc.lng])
  const { destinations: nearby } = useNearbyDestinations(origin, latestLoc.areaName, 5)
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([])
  const [searchSelected, setSearchSelected] = useState<GeocodeResult | null>(null)
  const [activeAlerts, setActiveAlerts] = useState<number>(0)
  const [displayArea, setDisplayArea] = useState<string>("")
  const [displayCity, setDisplayCity] = useState<string>("")
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [osrmRoutes, setOsrmRoutes] = useState<Array<{ id: string; coords: [number, number][]; distanceKm: number; durationMin: number }>>([])

  useEffect(() => {
    if (!selectedDestination && nearby.length) setSelectedDestination(nearby[0].name)
  }, [nearby, selectedDestination])

  // Load and subscribe to safety alerts for realtime influence on route safety
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const city = latestLoc.areaName || undefined
      let q = supabase.from('safety_alerts').select('id, valid_from')
      if (city) q = q.eq('city', city)
      const { data, error } = await q
      if (!cancelled && !error && data) {
        const cutoff = Date.now() - 6 * 60 * 60 * 1000 // last 6 hours
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
      .channel('safety_alerts_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_alerts', ...(filter ? { filter } : {}) }, () => load())
      .subscribe()
    return () => { cancelled = true; try { supabase.removeChannel(channel) } catch {} }
  }, [supabase, latestLoc.areaName])

  // Resolve area/city when areaName is not yet available but we have coordinates
  useEffect(() => {
    let cancelled = false
    const resolve = async () => {
      if (latestLoc.areaName || latestLoc.lat == null || latestLoc.lng == null) return
      try {
        const r = await reverseGeocode(latestLoc.lat as number, latestLoc.lng as number)
        if (!cancelled) {
          if (r.area) setDisplayArea(r.area)
          if (r.city) setDisplayCity(r.city)
        }
      } catch {
        // ignore
      }
    }
    resolve()
    return () => { cancelled = true }
  }, [latestLoc.areaName, latestLoc.lat, latestLoc.lng])

  // Compute destination point from either search selection or nearby selection
  const destPoint = useMemo(() => {
    if (searchSelected) return { name: searchSelected.displayName, lat: searchSelected.lat, lng: searchSelected.lng }
    const found = nearby.find(p => p.name === selectedDestination)
    return found ? { name: found.name, lat: found.lat, lng: found.lng } : null
  }, [searchSelected, nearby, selectedDestination])

  // Fetch OSRM routes for map rendering when origin/destination is set
  useEffect(() => {
    let cancelled = false
    const loadRoutes = async () => {
      if (!origin || !destPoint) { setOsrmRoutes([]); return }
      try {
        const profile = 'driving' // single profile for alternatives; walking can be used if needed
        const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destPoint.lng},${destPoint.lat}?overview=full&geometries=geojson&alternatives=true`
        const res = await fetch(url)
        const json = await res.json()
        const routes = Array.isArray(json?.routes) ? json.routes : []
        const parsed = routes.slice(0,3).map((r: any, idx: number) => ({
          id: `r${idx}`,
          coords: (r.geometry?.coordinates || []).map((c: [number, number]) => [c[1], c[0]]),
          distanceKm: (r.distance ?? 0) / 1000,
          durationMin: Math.max(1, Math.round((r.duration ?? 0) / 60)),
        }))
        if (!cancelled) setOsrmRoutes(parsed)
      } catch (e) {
        if (!cancelled) setOsrmRoutes([])
      }
    }
    loadRoutes()
    return () => { cancelled = true }
  }, [origin?.lat, origin?.lng, destPoint?.lat, destPoint?.lng])

  // Debounced search for destination
  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      if (!search.trim()) { setSearchResults([]); return }
      const res = await forwardGeocode(search, 6)
      if (!cancelled) setSearchResults(res)
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search])

  // destPoint moved above for earlier availability

  const routeOptions: RouteOption[] = useMemo(() => {
    if (!destPoint || !origin) return []
    const osrm = osrmRoutes
    const baseDistance = haversineKm(origin, { lat: destPoint.lat, lng: destPoint.lng })
    // Compute dynamic routes: fastest, balanced, safest
    const speeds = { fastest: 35, balanced: 28, safest: 22 } // km/h approximation
    const baseScore = 90
    const alertPenalty = Math.min(20, activeAlerts * 8)
    const distancePenalty = Math.max(0, Math.min(10, (osrm[0]?.distanceKm ?? baseDistance) - 3)) // longer routes slightly less safe
    const score = (extra: number) => Math.max(50, Math.min(100, baseScore - alertPenalty - distancePenalty + extra))
    const risk = (s: number): RouteOption['riskLevel'] => (s >= 80 ? 'low' : s >= 65 ? 'medium' : 'high')
    const tipsBase: string[] = []
    if (activeAlerts > 0) tipsBase.push('Avoid hotspot areas')
    tipsBase.push((osrm[0]?.distanceKm ?? baseDistance) > 5 ? 'Prefer main roads' : 'Local streets ok')

    const minutes = (km: number, speedKmh: number) => Math.max(4, Math.round((km / speedKmh) * 60))
    // Use OSRM metrics when available; fallback to straight-line estimate
    const getDur = (idx: number, fallbackKm: number, speed: number) => osrm[idx]?.durationMin ?? minutes(fallbackKm, speed)
    const getDist = (idx: number, fallbackKm: number) => (osrm[idx]?.distanceKm ?? fallbackKm).toFixed(1)
    return [
      {
        id: 'fastest',
        name: 'Fastest',
        duration: `${getDur(0, baseDistance, speeds.fastest)} mins`,
        safetyScore: score(-2),
        distance: `${getDist(0, baseDistance)} km`,
        highlights: [...tipsBase, 'Traffic visibility'],
        riskLevel: risk(score(-2)),
      },
      {
        id: 'balanced',
        name: 'Balanced',
        duration: `${getDur(1, baseDistance, speeds.balanced)} mins`,
        safetyScore: score(0),
        distance: `${getDist(1, baseDistance)} km`,
        highlights: [...tipsBase, 'Well-lit segments'],
        riskLevel: risk(score(0)),
      },
      {
        id: 'safest',
        name: 'Safest',
        duration: `${getDur(2, baseDistance, speeds.safest)} mins`,
        safetyScore: score(4),
        distance: `${getDist(2, baseDistance)} km`,
        highlights: [...tipsBase, 'Main roads priority'],
        riskLevel: risk(score(4)),
      },
    ]
  }, [destPoint, origin, osrmRoutes, activeAlerts])

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleGetDirections = (routeId: string) => {
    if (!origin || !destPoint) return
    const route = routeOptions.find(r => r.id === routeId)
    const travelMode = route?.id === 'safest' ? 'walking' : 'driving'
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destPoint.lat},${destPoint.lng}&travelmode=${travelMode}`
    if (typeof window !== 'undefined') window.open(url, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Safer Routes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Destination */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Search destination</label>
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchSelected(null) }}
            placeholder="Type a place, address, or landmark"
          />
          {!!searchResults.length && (
            <div className="mt-2 border rounded-md divide-y bg-background">
              {searchResults.map((r) => (
                <button
                  key={`${r.lat},${r.lng}`}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted"
                  onClick={() => { setSearchSelected(r); setSelectedDestination(null); setSearchResults([]) }}
                >
                  {r.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Nearby Destination Selector */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Or pick a nearby destination</label>
          <div className="flex flex-wrap gap-2">
            {nearby.map((p) => (
              <Button
                key={p.name}
                variant={!searchSelected && selectedDestination === p.name ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedDestination(p.name); setSearchSelected(null) }}
                className={!searchSelected && selectedDestination !== p.name ? "bg-transparent" : ""}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Location */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            From: Your current location (
            {latestLoc.areaName || displayArea || displayCity || (
              latestLoc.lat != null && latestLoc.lng != null
                ? `${(latestLoc.lat as number).toFixed(2)}, ${(latestLoc.lng as number).toFixed(2)}`
                : 'Locating…'
            )}
            )
          </span>
        </div>

        {/* Map with routes */}
        {origin && destPoint && (
          <MapView
            center={{ lat: origin.lat, lng: origin.lng }}
            destination={{ lat: destPoint.lat, lng: destPoint.lng }}
            routes={osrmRoutes.map((r, idx) => ({
              id: r.id,
              coords: r.coords,
              color: idx === 0 ? '#2563eb' : idx === 1 ? '#10b981' : '#f59e0b',
              weight: selectedRouteId === ['fastest','balanced','safest'][idx] ? 6 : 4,
            }))}
            height={240}
          />
        )}

        {/* Route Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Recommended Routes {destPoint ? `to ${destPoint.name}` : ''}</h4>

          {routeOptions.map((route: RouteOption) => (
            <div key={route.id} className="border border-border rounded-lg p-4 space-y-3 cursor-pointer" onClick={() => setSelectedRouteId(route.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Route className="h-5 w-5 text-primary" />
                  <div>
                    <h5 className="font-medium text-foreground">{route.name}</h5>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {route.duration}
                      </span>
                      <span>{route.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">{route.safetyScore}</span>
                  </div>
                  <Badge className={getRiskBadgeColor(route.riskLevel)}>{route.riskLevel} risk</Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {route.highlights.map((highlight: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>

              <Button size="sm" onClick={() => handleGetDirections(route.id)} disabled={!origin} className="w-full">
                Open in Google Maps
              </Button>
            </div>
          ))}
          {!routeOptions.length && (
            <div className="text-sm text-muted-foreground">Select a destination to see suggested safer routes.</div>
          )}
        </div>

        {/* Safety Tips */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-foreground mb-2">Safety Tips</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Share your route with emergency contacts</li>
            <li>• Avoid isolated areas, especially after dark</li>
            <li>• Keep your phone charged and location services on</li>
            <li>• Trust your instincts and change routes if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
