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

/** Squared distance (deg²) from point to nearest point on a polyline segment. */
export function pointToPolylineDistanceSq(
  lat: number,
  lng: number,
  coordinates: number[][],
): number {
  if (coordinates.length === 0) return Infinity
  if (coordinates.length === 1) {
    const [lng0, lat0] = coordinates[0]
    return distanceSquared(lat, lng, lat0, lng0)
  }

  let best = Infinity
  for (let index = 0; index < coordinates.length - 1; index += 1) {
    const [lngA, latA] = coordinates[index]
    const [lngB, latB] = coordinates[index + 1]
    const dx = lngB - lngA
    const dy = latB - latA
    const lengthSq = dx * dx + dy * dy
    const t =
      lengthSq > 0
        ? Math.max(0, Math.min(1, ((lng - lngA) * dx + (lat - latA) * dy) / lengthSq))
        : 0
    const projLat = latA + t * dy
    const projLng = lngA + t * dx
    best = Math.min(best, distanceSquared(lat, lng, projLat, projLng))
  }
  return best
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
