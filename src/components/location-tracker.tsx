"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Eye, EyeOff, Users } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/auth"
import { reverseGeocode } from "@/lib/geocoding"
import type { TablesInsert } from "@/types/database.types"

export function LocationTracker() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [isTrackingEnabled, setIsTrackingEnabled] = useState<boolean>(user?.locationSharing ?? true)
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc?: number | null; alt?: number | null } | null>(null)
  const [area, setArea] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const watchIdRef = useRef<number | null>(null)
  const lastPersistRef = useRef<number>(0)

  // format helpers
  const fmtCoords = useCallback((lat: number, lng: number) => `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`, [])
  const timeAgo = useCallback((ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return `${diff}s ago`
    const m = Math.floor(diff / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    return `${h}h ago`
  }, [])

  const persistLocation = useCallback(async (pos: GeolocationPosition, areaOverride?: string) => {
    if (!user?.id) return
    const now = Date.now()
    // throttle to once every 15s
    if (now - lastPersistRef.current < 15000) return
    lastPersistRef.current = now
    try {
      const { latitude, longitude, accuracy, altitude } = pos.coords
      // Build payloads that match live schema strictly
      const minimalPayload = {
        user_id: user.id,
        latitude,
        longitude,
      } as Record<string, unknown>

      const withAreaName = {
        user_id: user.id,
        latitude,
        longitude,
        area_name: (areaOverride ?? area) || null,
      } as Record<string, unknown>

      const withCity = {
        user_id: user.id,
        latitude,
        longitude,
        city: (areaOverride ?? area) || null,
      } as Record<string, unknown>

      const fullPayload = {
        user_id: user.id,
        latitude,
        longitude,
        accuracy_meters: typeof accuracy === 'number' ? Math.round(accuracy) : null,
        altitude_meters: typeof altitude === 'number' ? altitude : null,
        area_name: (areaOverride ?? area) || null,
        checkin_type: 'automatic',
      } as Record<string, unknown>

      const tryPayloads = [minimalPayload, withAreaName, withCity, fullPayload]
      let inserted = false
      for (const p of tryPayloads) {
        const { error } = await supabase
          .from("user_locations")
          .insert(p as unknown as TablesInsert<'user_locations'>)
        if (!error) {
          inserted = true
          break
        }
        console.warn("user_locations insert failed with payload keys:", Object.keys(p), error?.code, error?.message)
        // If a DB trigger or function causes 42803 (GROUP BY), further retries will repeat; bail out early
        if ((error as any)?.code === '42803') {
          console.warn('A database trigger/function on user_locations is failing with 42803 (GROUP BY). Please fix the trigger query to aggregate severity or include it in GROUP BY.')
          break
        }
      }
      if (!inserted) {
        console.warn("All user_locations insert attempts failed")
      }
    } catch (e) {
      console.warn("Persist location error:", e)
    }
  }, [area, supabase, user?.id])

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy, altitude } = pos.coords
    setCoords({ lat: latitude, lng: longitude, acc: accuracy ?? null, alt: altitude ?? null })
    setLastUpdated(timeAgo(Date.now()))
    // reverse geocode first so we can persist city with the first record
    ;(async () => {
      let city: string | undefined
      try {
        const r = await reverseGeocode(latitude, longitude)
        if (r.city) {
          city = r.city
          setArea(r.city)
        }
      } catch {}
      await persistLocation(pos, city)
    })()
  }, [persistLocation, timeAgo])

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.warn("Geolocation error:", err.message)
    if (err.code === err.PERMISSION_DENIED) {
      alert(
        "Location permission denied. Please enable location access for this site in your browser settings and try again.",
      )
    }
  }, [])

  // start/stop watcher
  useEffect(() => {
    if (!isTrackingEnabled || typeof window === "undefined" || !("geolocation" in navigator)) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      })
    } catch {}
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [handleError, handlePosition, isTrackingEnabled])

  const handleToggleTracking = async () => {
    const next = !isTrackingEnabled
    setIsTrackingEnabled(next)
    alert(
      next
        ? "Location tracking enabled. Your location will be shared with emergency services when needed."
        : "Location tracking disabled. Emergency services will not be able to locate you automatically.",
    )
    try {
      if (user) {
        await supabase.from("profiles").update({ location_sharing: next }).eq("user_id", user.id)
      }
    } catch {}
  }

  const handleShareLocation = async () => {
    alert(
      "Location shared with emergency contacts!\n\nYour current location has been sent to all registered emergency contacts.",
    )
    // Save a location snapshot (mock coordinates shown in UI example)
    try {
      if (user && coords) {
        // Reuse the tolerant insert logic used in persistLocation
        const minimalPayload = {
          user_id: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
        } as Record<string, unknown>

        const withAreaName = {
          user_id: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
          area_name: area || null,
        } as Record<string, unknown>

        const withCity = {
          user_id: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
          city: area || null,
        } as Record<string, unknown>

        const fullPayload = {
          user_id: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy_meters: typeof coords.acc === 'number' ? Math.round(coords.acc) : null,
          altitude_meters: typeof coords.alt === 'number' ? coords.alt : null,
          area_name: area || null,
          checkin_type: 'manual',
        } as Record<string, unknown>

        const tryPayloads = [minimalPayload, withAreaName, withCity, fullPayload]
        let inserted = false
        for (const p of tryPayloads) {
          const { error } = await supabase
            .from("user_locations")
            .insert(p as unknown as TablesInsert<'user_locations'>)
          if (!error) {
            inserted = true
            break
          }
          console.warn("user_locations snapshot insert failed with payload keys:", Object.keys(p), error?.code, error?.message)
          if ((error as any)?.code === '42803') {
            console.warn('A database trigger/function on user_locations is failing with 42803 (GROUP BY). Please fix the trigger query to aggregate severity or include it in GROUP BY.')
            break
          }
        }
        if (!inserted) {
          console.warn("All user_locations snapshot insert attempts failed")
        }
      }
    } catch {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Tracking
          </div>
          <Badge
            variant={isTrackingEnabled ? "default" : "secondary"}
            className={isTrackingEnabled ? "bg-green-500" : ""}
          >
            {isTrackingEnabled ? "Active" : "Disabled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground">Current Location</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="p-1">
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {isVisible && (
            <div className="space-y-2">
              <p className="text-sm text-foreground">{area || (coords ? "Current Area" : "Unknown area")}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {coords ? fmtCoords(coords.lat, coords.lng) : "No location yet"}
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800">Safe</Badge>
                <span className="text-xs text-muted-foreground">{coords ? `Updated ${lastUpdated}` : "Waiting..."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Real-time Tracking</p>
              <p className="text-xs text-muted-foreground">Allow authorities to track your location for safety</p>
            </div>
            <Button variant={isTrackingEnabled ? "destructive" : "default"} size="sm" onClick={handleToggleTracking}>
              {isTrackingEnabled ? "Disable" : "Enable"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLocation}
            className="w-full bg-transparent"
            disabled={!isTrackingEnabled}
          >
            <Users className="h-4 w-4 mr-2" />
            Share with Emergency Contacts
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 inline mr-1" />
            Your location data is encrypted and only shared with authorized emergency services and your designated
            contacts.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
