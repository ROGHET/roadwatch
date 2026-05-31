import type { MapCoordinates, TrafficProvider, TrafficSnapshot } from './types'

function nowIso() {
  return new Date().toISOString()
}

function locationLabel(lat: number, lng: number): string {
  return `Traffic corridor (${lat.toFixed(3)}, ${lng.toFixed(3)})`
}

function buildMockTraffic({ lat, lng }: MapCoordinates, source: string): TrafficSnapshot {
  return {
    locationName: locationLabel(lat, lng),
    condition: 'moderate',
    description: 'Data unavailable',
    source,
    observedAt: nowIso(),
  }
}

export const mockTrafficProvider: TrafficProvider = {
  id: 'mock-traffic',
  label: 'Mock traffic provider',
  async getTraffic(request) {
    return buildMockTraffic(request, 'Mock traffic provider')
  },
}

export function createTrafficApiProvider(endpoint: string, label: string): TrafficProvider {
  return {
    id: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    async getTraffic({ lat, lng }) {
      const response = await fetch(`${endpoint}?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error(`${label} request failed`)
      }

      const payload = (await response.json()) as {
        condition?: TrafficSnapshot['condition']
        description?: string
        locationName?: string
      }

      return {
        locationName: payload.locationName?.trim() || locationLabel(lat, lng),
        condition: payload.condition ?? 'moderate',
        description: payload.description ?? 'Traffic telemetry is available for this corridor.',
        source: label,
        observedAt: nowIso(),
      }
    },
  }
}

export function resolveTrafficProvider(env: ImportMetaEnv): TrafficProvider {
  const provider = env.VITE_MAP_TRAFFIC_PROVIDER?.trim().toLowerCase()
  const trafficEndpoint = env.VITE_TRAFFIC_API_ENDPOINT?.trim()

  if (provider === 'api' && trafficEndpoint) {
    return createTrafficApiProvider(trafficEndpoint, 'Traffic API')
  }

  return mockTrafficProvider
}
