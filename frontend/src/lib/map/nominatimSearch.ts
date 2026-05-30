export type NominatimSearchResult = {
  id: string
  label: string
  description: string
  lat: number
  lng: number
  kind: 'place' | 'road' | 'coordinates'
}

const CACHE_KEY = 'rw-nominatim-recent'
const MAX_CACHE = 12

type CachedSearch = NominatimSearchResult & { searchedAt: string }

function readCache(): CachedSearch[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CachedSearch[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCache(entry: NominatimSearchResult) {
  const next: CachedSearch[] = [
    { ...entry, searchedAt: new Date().toISOString() },
    ...readCache().filter((item) => item.id !== entry.id),
  ].slice(0, MAX_CACHE)
  localStorage.setItem(CACHE_KEY, JSON.stringify(next))
}

export function getRecentNominatimSearches(): NominatimSearchResult[] {
  return readCache()
}

function parseCoordinates(query: string): { lat: number; lng: number } | null {
  const match = query.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const lat = Number.parseFloat(match[1])
  const lng = Number.parseFloat(match[2])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

export async function searchNominatim(query: string): Promise<NominatimSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const coords = parseCoordinates(trimmed)
  if (coords) {
    const result: NominatimSearchResult = {
      id: `coord:${coords.lat},${coords.lng}`,
      label: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
      description: 'Coordinates',
      lat: coords.lat,
      lng: coords.lng,
      kind: 'coordinates',
    }
    writeCache(result)
    return [result]
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', trimmed)
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '8')
  url.searchParams.set('countrycodes', 'in')

  const response = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'RoadWatch/1.0' },
  })

  if (!response.ok) return []

  const payload = (await response.json()) as Array<{
    place_id?: number
    display_name?: string
    lat?: string
    lon?: string
    type?: string
    class?: string
    address?: Record<string, string>
  }>

  const results = payload
    .filter((item) => item.lat && item.lon)
    .map((item) => {
      const lat = Number.parseFloat(item.lat!)
      const lng = Number.parseFloat(item.lon!)
      const address = item.address ?? {}
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.state_district ||
        ''
      const state = address.state || ''
      const road = address.road || address.highway || ''
      const label =
        road ||
        city ||
        item.display_name?.split(',')[0]?.trim() ||
        item.display_name ||
        'Location'
      const description = [city, state, item.type].filter(Boolean).join(' • ')
      const kind: NominatimSearchResult['kind'] =
        item.class === 'highway' || road ? 'road' : 'place'

      return {
        id: `nom:${item.place_id ?? `${lat},${lng}`}`,
        label,
        description: description || item.display_name || 'OpenStreetMap result',
        lat,
        lng,
        kind,
      } satisfies NominatimSearchResult
    })

  if (results[0]) writeCache(results[0])
  return results
}

export const ROAD_TYPE_FILTER_OPTIONS = [
  'NH',
  'SH',
  'MDR',
  'Urban Road',
  'Village Road',
  'Expressway',
] as const

export type MapRoadTypeFilter = (typeof ROAD_TYPE_FILTER_OPTIONS)[number]

export const SEVERITY_FILTER_OPTIONS = ['critical', 'high', 'medium', 'low'] as const
