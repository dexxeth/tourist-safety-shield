export type LatLng = { lat: number; lng: number }

export type PopularPlace = {
  name: string
  city: string
  lat: number
  lng: number
}

// Minimal dataset focusing on Mumbai plus a few other popular spots
export const POPULAR_PLACES: PopularPlace[] = [
  { name: 'Gateway of India', city: 'Mumbai', lat: 18.9220, lng: 72.8347 },
  { name: 'Marine Drive', city: 'Mumbai', lat: 18.9432, lng: 72.8238 },
  { name: 'Colaba Causeway', city: 'Mumbai', lat: 18.9225, lng: 72.8326 },
  { name: 'Chhatrapati Shivaji Terminus', city: 'Mumbai', lat: 18.9402, lng: 72.8356 },
  { name: 'Elephanta Caves', city: 'Mumbai', lat: 18.9633, lng: 72.9316 },
  { name: 'India Gate', city: 'New Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Qutub Minar', city: 'New Delhi', lat: 28.5245, lng: 77.1855 },
  { name: 'Taj Mahal', city: 'Agra', lat: 27.1751, lng: 78.0421 },
]

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon))
  return R * c
}

export function getNearbyPopularPlaces(origin: LatLng | null, areaName?: string | null, limit: number = 5): PopularPlace[] {
  let candidates = POPULAR_PLACES
  if (areaName) {
    const city = areaName.toLowerCase()
    const cityMatches = candidates.filter(p => p.city.toLowerCase().includes(city))
    if (cityMatches.length) candidates = cityMatches
  }
  if (!origin) return candidates.slice(0, limit)
  return [...candidates]
    .map(p => ({ p, d: haversineKm(origin, { lat: p.lat, lng: p.lng }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(x => x.p)
}
