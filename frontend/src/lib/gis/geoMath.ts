export type LatLng = { lat: number; lng: number }

export function distanceSquared(latA: number, lngA: number, latB: number, lngB: number): number {
  return (latA - latB) ** 2 + (lngA - lngB) ** 2
}

export function haversineKm(latA: number, lngA: number, latB: number, lngB: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(latB - latA)
  const dLng = toRad(lngB - lngA)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function lineCentroid(coordinates: number[][]): LatLng | null {
  if (coordinates.length === 0) return null
  let lat = 0
  let lng = 0
  for (const [lngVal, latVal] of coordinates) {
    lng += lngVal
    lat += latVal
  }
  return { lat: lat / coordinates.length, lng: lng / coordinates.length }
}

export function bboxFromCoordinates(coordinates: number[][]): [number, number, number, number] | null {
  if (coordinates.length === 0) return null
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const [lngVal, latVal] of coordinates) {
    minLat = Math.min(minLat, latVal)
    maxLat = Math.max(maxLat, latVal)
    minLng = Math.min(minLng, lngVal)
    maxLng = Math.max(maxLng, lngVal)
  }
  return [minLat, minLng, maxLat, maxLng]
}
