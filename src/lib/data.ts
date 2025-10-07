"use client"

import { createClient } from "@/utils/supabase/client"
import { haversineKm } from "@/lib/geo"
import type { LatLng } from "@/lib/geo"

export async function listAccommodations(city?: string) {
  const supabase = createClient()
  let q = supabase
    .from("accommodations")
    .select("id, name, accommodation_type, average_rating, is_verified, price_range, amenities, address, city, created_at")
    .order("created_at", { ascending: false })
  if (city) q = q.eq("city", city)
  try {
    const { data, error } = await q
    if (error) throw error
    // Map DB fields to UI-friendly names expected by components
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.accommodation_type,
      rating: r.average_rating,
      safety_score: null, // not available in schema; keep null
      price_text: r.price_range,
      verified: !!r.is_verified,
      amenities: r.amenities,
      area: r.address ? String(r.address).split(',')[0] : r.city,
      city: r.city,
    }))
  } catch (e: any) {
    console.warn('Accommodations unavailable, returning empty list:', e?.message || e)
    return []
  }
}

export async function listSafetyAlerts(city?: string) {
  const supabase = createClient()
  let q = supabase
    .from("safety_alerts")
    .select("id, alert_type, title, description, location_description, city, severity, status, valid_from")
    .order("valid_from", { ascending: false })
  if (city) q = q.eq("city", city)
  const { data, error } = await q
  if (error) throw error
  // Map to UI shape
  return (data || []).map((r: any) => ({
    id: r.id,
    type: r.severity === 'critical' ? 'critical' : r.severity === 'low' ? 'info' : 'warning',
    title: r.title,
    message: r.description,
    location_text: r.location_description,
    city: r.city,
    starts_at: r.valid_from,
    status: r.status,
  }))
}

export type NearbyAccommodation = {
  id: string
  name: string
  lat: number
  lng: number
  address: string | null
  city: string | null
  safety_features?: string[] | null
  distance_km: number
}

export async function listNearbyAccommodations(origin: LatLng | null, city?: string | null, limit: number = 8): Promise<NearbyAccommodation[]> {
  const supabase = createClient()
  let q = supabase
    .from("accommodations")
    .select("id, name, latitude, longitude, address, city, safety_features")
    .order("created_at", { ascending: false })
  if (city) q = q.eq("city", city)
  try {
    const { data, error } = await q
    if (error) throw error
    const rows = (data || []) as any[]
    const withCoords = rows.filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number')
    const computeDistance = (r: any) => origin ? haversineKm(origin, { lat: r.latitude, lng: r.longitude }) : Number.POSITIVE_INFINITY
    const sorted = withCoords
      .map(r => ({
        id: r.id,
        name: r.name,
        lat: r.latitude,
        lng: r.longitude,
        address: r.address ?? null,
        city: r.city ?? null,
        safety_features: r.safety_features ?? null,
        distance_km: computeDistance(r),
      }))
      .sort((a, b) => a.distance_km - b.distance_km)
    return origin ? sorted.slice(0, limit) : sorted.slice(0, limit)
  } catch (e: any) {
    console.warn('Nearby accommodations unavailable:', e?.message || e)
    return []
  }
}

export async function dismissAlert(alertId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  await supabase.from("notifications").upsert({
    user_id: session.user.id,
    type: "safety_alert",
    title: "Alert dismissed",
    message: "User dismissed safety alert",
    data: { alert_id: alertId, dismissed: true },
    dismissed_at: new Date().toISOString()
  })
}
