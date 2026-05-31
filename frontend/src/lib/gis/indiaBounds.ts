export const INDIA_LAT_MIN = 6
export const INDIA_LAT_MAX = 38
export const INDIA_LNG_MIN = 68
export const INDIA_LNG_MAX = 98

export function isWithinIndia(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  return (
    lat >= INDIA_LAT_MIN &&
    lat <= INDIA_LAT_MAX &&
    lng >= INDIA_LNG_MIN &&
    lng <= INDIA_LNG_MAX
  )
}

export function parseIndiaCoordinate(
  latValue: string | number | undefined,
  lngValue: string | number | undefined,
): { lat: number; lng: number } | null {
  const lat =
    typeof latValue === 'number'
      ? latValue
      : Number(String(latValue ?? '').replace(/[^\d.-]/g, ''))
  const lng =
    typeof lngValue === 'number'
      ? lngValue
      : Number(String(lngValue ?? '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return isWithinIndia(lat, lng) ? { lat, lng } : null
}
