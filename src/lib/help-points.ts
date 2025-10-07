export type HelpPoint = {
  name: string
  type: 'police' | 'hospital' | 'embassy' | 'helpline'
  lat: number
  lng: number
  city?: string
}

export const HELP_POINTS: HelpPoint[] = [
  // Mumbai
  { name: 'Colaba Police Station', type: 'police', lat: 18.9085, lng: 72.8147, city: 'Mumbai' },
  { name: 'Fort Police Station', type: 'police', lat: 18.9323, lng: 72.8331, city: 'Mumbai' },
  { name: 'Bombay Hospital', type: 'hospital', lat: 18.9440, lng: 72.8276, city: 'Mumbai' },
  { name: 'Breach Candy Hospital', type: 'hospital', lat: 18.9727, lng: 72.8063, city: 'Mumbai' },
  { name: 'US Consulate Mumbai', type: 'embassy', lat: 19.0657, lng: 72.8681, city: 'Mumbai' },
  // Delhi
  { name: 'Connaught Place Police Station', type: 'police', lat: 28.6315, lng: 77.2167, city: 'Delhi' },
  { name: 'Ram Manohar Lohia Hospital', type: 'hospital', lat: 28.6266, lng: 77.2054, city: 'Delhi' },
  { name: 'AIIMS New Delhi', type: 'hospital', lat: 28.5669, lng: 77.2090, city: 'Delhi' },
  { name: 'US Embassy New Delhi', type: 'embassy', lat: 28.5983, lng: 77.1819, city: 'Delhi' },
  // Goa
  { name: 'Panaji Police Station', type: 'police', lat: 15.4989, lng: 73.8278, city: 'Panaji' },
  { name: 'Goa Medical College', type: 'hospital', lat: 15.4889, lng: 73.8203, city: 'Panaji' },
]

export function countNearbyHelpPoints(origin: { lat: number; lng: number } | null, city?: string | null, maxKm = 8) {
  if (!origin) return 0
  const { lat, lng } = origin
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dist = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const dLat = toRad(bLat - aLat)
    const dLng = toRad(bLng - aLng)
    const s1 = Math.sin(dLat / 2)
    const s2 = Math.sin(dLng / 2)
    const aa = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(aa)))
  }
  return HELP_POINTS.filter((p) => {
    if (city && p.city && p.city.toLowerCase() !== city.toLowerCase()) return false
    return dist(lat, lng, p.lat, p.lng) <= maxKm
  }).length
}
