import type { GeolocationPosition } from '../../hooks/useGeolocation'

const CACHE_KEY = 'roadwatch:last-location'
const CACHE_TTL_MS = 30 * 60 * 1000

type CachedLocation = GeolocationPosition & {
  savedAt: number
}

export function readCachedLocation(): GeolocationPosition | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CachedLocation
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return {
      lat: parsed.lat,
      lng: parsed.lng,
      accuracy: parsed.accuracy,
      heading: parsed.heading,
    }
  } catch {
    return null
  }
}

export function writeCachedLocation(position: GeolocationPosition): void {
  try {
    const payload: CachedLocation = { ...position, savedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable */
  }
}

export function clearCachedLocation(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* storage unavailable */
  }
}
