const CACHE_TTL_MS = 10 * 60 * 1000

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function cacheKey(lat: number, lng: number, kind: string) {
  return `${kind}:${lat.toFixed(3)}:${lng.toFixed(3)}`
}

export function getCachedIntelligence<T>(lat: number, lng: number, kind: string): T | null {
  const key = cacheKey(lat, lng, kind)
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export function setCachedIntelligence<T>(lat: number, lng: number, kind: string, value: T): T {
  cache.set(cacheKey(lat, lng, kind), {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
  return value
}
