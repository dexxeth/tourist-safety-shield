export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string | null; area: string | null; displayName?: string | null }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
    const json = await res.json()
    const addr = json?.address || {}
    const area = addr.neighbourhood || addr.neighborhood || addr.suburb || addr.quarter || addr.city_district || addr.hamlet || null
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || null
    return { city, area, displayName: json?.display_name || null }
  } catch (e) {
    console.warn('reverseGeocode error', e)
    return { city: null, area: null, displayName: null }
  }
}

export type GeocodeResult = {
  displayName: string
  lat: number
  lng: number
}

export async function forwardGeocode(query: string, limit: number = 5): Promise<GeocodeResult[]> {
  try {
    if (!query.trim()) return []
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=${limit}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) throw new Error(`Forward geocode failed: ${res.status}`)
    const arr = await res.json()
    if (!Array.isArray(arr)) return []
    return arr.map((r: any) => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    })).filter((x: any) => Number.isFinite(x.lat) && Number.isFinite(x.lng))
  } catch (e) {
    console.warn('forwardGeocode error', e)
    return []
  }
}
