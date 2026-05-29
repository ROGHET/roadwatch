import type { MapCoordinates, RouteProvider } from './types'
import { INDIA_CENTER } from '../constants'

function nowIso() {
  return new Date().toISOString()
}

function isFiniteCoordinate(point: MapCoordinates) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
}

function isIndiaBounded(point: MapCoordinates) {
  return point.lat >= 5 && point.lat <= 38 && point.lng >= 67 && point.lng <= 99
}

function haversineDistanceKm(origin: MapCoordinates, destination: MapCoordinates): number {
  const earthRadiusKm = 6371
  const lat1 = (origin.lat * Math.PI) / 180
  const lat2 = (destination.lat * Math.PI) / 180
  const deltaLat = ((destination.lat - origin.lat) * Math.PI) / 180
  const deltaLng = ((destination.lng - origin.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
}

function normalizeLongitudeDelta(originLng: number, destinationLng: number) {
  const delta = destinationLng - originLng
  const wrappedDelta = ((((delta + 180) % 360) + 360) % 360) - 180
  return originLng + wrappedDelta
}

function canonicalizeRouteEndpoints(origin: MapCoordinates, destination: MapCoordinates) {
  return {
    origin: { lat: origin.lat, lng: ((origin.lng + 540) % 360) - 180 },
    destination: {
      lat: destination.lat,
      lng: normalizeLongitudeDelta(origin.lng, destination.lng),
    },
  }
}

function validateRouteGeometry(
  origin: MapCoordinates,
  destination: MapCoordinates,
  path: MapCoordinates[],
  distanceKm: number,
) {
  if (!isFiniteCoordinate(origin) || !isFiniteCoordinate(destination)) {
    throw new Error('Invalid route coordinates')
  }

  if (!isIndiaBounded(origin) || !isIndiaBounded(destination)) {
    throw new Error('Route outside supported bounds')
  }

  if (Math.abs(origin.lat - INDIA_CENTER.lat) < 0.001 && Math.abs(origin.lng - INDIA_CENTER.lng) < 0.001) {
    throw new Error('Route origin is the default placeholder')
  }

  if (haversineDistanceKm(origin, destination) < 0.05) {
    throw new Error('Route origin and destination are the same')
  }

  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 1500) {
    throw new Error('Unrealistic route distance')
  }

  if (path.length < 2) {
    throw new Error('Route path incomplete')
  }

  const first = path[0]
  const last = path[path.length - 1]

  if (!isFiniteCoordinate(first) || !isFiniteCoordinate(last)) {
    throw new Error('Route geometry invalid')
  }

  const startsNearOrigin = haversineDistanceKm(origin, first) <= 5
  const endsNearDestination = haversineDistanceKm(destination, last) <= 5

  if (!startsNearOrigin || !endsNearDestination) {
    throw new Error('Route geometry does not match selected points')
  }

  const minLat = Math.min(origin.lat, destination.lat) - 3
  const maxLat = Math.max(origin.lat, destination.lat) + 3
  const minLng = Math.min(origin.lng, destination.lng) - 3
  const maxLng = Math.max(origin.lng, destination.lng) + 3
  let pathDistanceKm = 0

  for (const point of path) {
    if (!isFiniteCoordinate(point) || !isIndiaBounded(point)) {
      throw new Error('Route geometry leaves supported bounds')
    }

    if (point.lat < minLat || point.lat > maxLat || point.lng < minLng || point.lng > maxLng) {
      throw new Error('Route geometry leaves selected corridor')
    }
  }

  for (let index = 1; index < path.length; index += 1) {
    pathDistanceKm += haversineDistanceKm(path[index - 1], path[index])
  }

  if (pathDistanceKm > Math.max(distanceKm * 2.5, distanceKm + 120)) {
    throw new Error('Route geometry is too indirect')
  }
}

function routeOverview(distanceKm: number, travelTimeMinutes: number): string {
  const distance = distanceKm.toFixed(1)
  const minutes = Math.max(1, Math.round(travelTimeMinutes))
  return `Recommended preview route spans ${distance} km and should take about ${minutes} minutes under typical corridor conditions.`
}

function routeInstructions(destinationLabel: string): string[] {
  return [
    `Head toward ${destinationLabel} using the nearest arterial corridor.`,
    'Continue through the highlighted junctions shown on the map once live routing is enabled.',
    'Turn-by-turn instructions will replace this placeholder after the route engine is connected.',
  ]
}

function buildRouteSnapshot(args: {
  origin: MapCoordinates
  destination: MapCoordinates
  originLabel: string
  destinationLabel: string
  source: string
  distanceMultiplier?: number
  speedKph?: number
}): Awaited<ReturnType<RouteProvider['getRoutePreview']>> {
  const { origin, destination } = canonicalizeRouteEndpoints(args.origin, args.destination)
  const distanceKm = Math.max(
    0.8,
    haversineDistanceKm(origin, destination) * (args.distanceMultiplier ?? 1.18),
  )
  const travelTimeMinutes = Math.max(4, (distanceKm / (args.speedKph ?? 30)) * 60)

  return {
    origin,
    destination,
    originLabel: args.originLabel,
    destinationLabel: args.destinationLabel,
    distanceKm: Number(distanceKm.toFixed(1)),
    travelTimeMinutes: Math.round(travelTimeMinutes),
    overview: routeOverview(distanceKm, travelTimeMinutes),
    instructions: routeInstructions(args.destinationLabel),
    path: [],
    source: args.source,
    observedAt: nowIso(),
  }
}

function parseOpenRouteServiceSteps(steps: Array<{ instruction?: string }>): string[] {
  return steps.length > 0
    ? steps.map((step) => step.instruction ?? 'Continue along the planned route.')
    : []
}

export const mockRouteProvider: RouteProvider = {
  id: 'mock-route',
  label: 'Mock route provider',
  async getRoutePreview({ origin, destination, originLabel, destinationLabel }) {
    return buildRouteSnapshot({
      origin,
      destination,
      originLabel,
      destinationLabel,
      source: 'Mock route provider',
      distanceMultiplier: 1.22,
      speedKph: 28,
    })
  },
}

export function createOpenRouteServiceProvider(apiKey: string): RouteProvider {
  return {
    id: 'openrouteservice',
    label: 'OpenRouteService',
    async getRoutePreview({ origin, destination, originLabel, destinationLabel }) {
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat],
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('OpenRouteService request failed')
      }

      const payload = (await response.json()) as {
        routes?: Array<{
          summary?: { distance?: number; duration?: number }
          segments?: Array<{ steps?: Array<{ instruction?: string }> }>
          geometry?: { coordinates?: Array<[number, number]> }
        }>
      }

      const summary = payload.routes?.[0]?.summary
      const steps = payload.routes?.[0]?.segments?.[0]?.steps ?? []
      const geometry = payload.routes?.[0]?.geometry?.coordinates ?? []
      const snapshot = buildRouteSnapshot({
        origin,
        destination,
        originLabel,
        destinationLabel,
        source: 'OpenRouteService',
        distanceMultiplier: 1,
        speedKph: summary?.duration ? ((summary.distance ?? 0) / 1000) / (summary.duration / 3600) : 30,
      })
      const responsePath = geometry.length > 1 ? geometry.map(([lng, lat]) => ({ lat, lng })) : []
      validateRouteGeometry(snapshot.origin, snapshot.destination, responsePath, snapshot.distanceKm)

      return {
        ...snapshot,
        distanceKm: Number((((summary?.distance ?? 0) / 1000) || snapshot.distanceKm).toFixed(1)),
        travelTimeMinutes: Math.round((summary?.duration ?? snapshot.travelTimeMinutes * 60) / 60),
        instructions: parseOpenRouteServiceSteps(steps).length
          ? parseOpenRouteServiceSteps(steps)
          : snapshot.instructions,
        path: responsePath,
      }
    },
  }
}

export function createMapboxDirectionsProvider(apiKey: string): RouteProvider {
  return {
    id: 'mapbox-directions',
    label: 'Mapbox Directions',
    async getRoutePreview({ origin, destination, originLabel, destinationLabel }) {
      const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error('Mapbox Directions request failed')
      }

      const payload = (await response.json()) as {
        routes?: Array<{
          distance?: number
          duration?: number
          geometry?: { coordinates?: Array<[number, number]> }
          legs?: Array<{ steps?: Array<{ maneuvers?: { instruction?: string } }> }>
        }>
      }

      const route = payload.routes?.[0]
      const instructions = route?.legs?.[0]?.steps?.map(
        (step) => step.maneuvers?.instruction ?? 'Continue along the planned route.',
      )

      const snapshot = buildRouteSnapshot({
        origin,
        destination,
        originLabel,
        destinationLabel,
        source: 'Mapbox Directions',
        distanceMultiplier: 1,
        speedKph: route?.duration ? (((route.distance ?? 0) / 1000) / (route.duration / 3600)) : 30,
      })
      const responsePath =
        route?.geometry?.coordinates?.length && route.geometry.coordinates.length > 1
          ? route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
          : []
      validateRouteGeometry(snapshot.origin, snapshot.destination, responsePath, snapshot.distanceKm)

      return {
        ...snapshot,
        distanceKm: Number((((route?.distance ?? 0) / 1000) || snapshot.distanceKm).toFixed(1)),
        travelTimeMinutes: Math.round((route?.duration ?? snapshot.travelTimeMinutes * 60) / 60),
        instructions: instructions?.length ? instructions : snapshot.instructions,
        path: responsePath,
      }
    },
  }
}

export function createOsrmRouteProvider(baseUrl = 'https://router.project-osrm.org'): RouteProvider {
  return {
    id: 'osrm',
    label: 'OSRM',
    async getRoutePreview({ origin, destination, originLabel, destinationLabel }) {
      const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
      const url = new URL(`/route/v1/driving/${coordinates}`, baseUrl)
      url.searchParams.set('overview', 'full')
      url.searchParams.set('steps', 'true')
      url.searchParams.set('geometries', 'geojson')

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('OSRM request failed')
      }

      const payload = (await response.json()) as {
        routes?: Array<{
          distance?: number
          duration?: number
          geometry?: { coordinates?: Array<[number, number]> }
          legs?: Array<{ steps?: Array<{ maneuver?: { instruction?: string } }> }>
        }>
      }

      const route = payload.routes?.[0]
      const instructions = route?.legs?.[0]?.steps?.map(
        (step) => step.maneuver?.instruction ?? 'Continue along the planned route.',
      )

      const snapshot = buildRouteSnapshot({
        origin,
        destination,
        originLabel,
        destinationLabel,
        source: 'OSRM',
        distanceMultiplier: 1,
        speedKph: route?.duration ? (((route.distance ?? 0) / 1000) / (route.duration / 3600)) : 30,
      })
      const responsePath =
        route?.geometry?.coordinates?.length && route.geometry.coordinates.length > 1
          ? route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
          : []
      validateRouteGeometry(snapshot.origin, snapshot.destination, responsePath, snapshot.distanceKm)

      return {
        ...snapshot,
        distanceKm: Number((((route?.distance ?? 0) / 1000) || snapshot.distanceKm).toFixed(1)),
        travelTimeMinutes: Math.round((route?.duration ?? snapshot.travelTimeMinutes * 60) / 60),
        instructions: instructions?.length ? instructions : snapshot.instructions,
        path: responsePath,
      }
    },
  }
}

export function resolveRouteProvider(env: ImportMetaEnv): RouteProvider {
  const provider = env.VITE_MAP_ROUTE_PROVIDER?.trim().toLowerCase()
  const openRouteServiceKey = env.VITE_OPENROUTESERVICE_API_KEY?.trim()
  const mapboxKey = env.VITE_MAPBOX_DIRECTIONS_API_KEY?.trim()
  const osrmEndpoint = env.VITE_OSRM_BASE_URL?.trim()

  if (provider === 'openrouteservice' && openRouteServiceKey) {
    return createOpenRouteServiceProvider(openRouteServiceKey)
  }

  if (provider === 'mapbox' && mapboxKey) {
    return createMapboxDirectionsProvider(mapboxKey)
  }

  if (provider === 'osrm' && osrmEndpoint) {
    return createOsrmRouteProvider(osrmEndpoint)
  }

  if (openRouteServiceKey) {
    return createOpenRouteServiceProvider(openRouteServiceKey)
  }

  if (mapboxKey) {
    return createMapboxDirectionsProvider(mapboxKey)
  }

  if (osrmEndpoint) {
    return createOsrmRouteProvider(osrmEndpoint)
  }

  return mockRouteProvider
}
