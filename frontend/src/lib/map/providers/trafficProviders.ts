import type { MapCoordinates, TrafficProvider, TrafficSnapshot } from './types'

function nowIso() {
  return new Date().toISOString()
}

function locationLabel(lat: number, lng: number): string {
  return `Traffic corridor (${lat.toFixed(3)}, ${lng.toFixed(3)})`
}

function hashCoordinates(lat: number, lng: number): number {
  const latKey = Math.round(lat * 100)
  const lngKey = Math.round(lng * 100)
  return Math.abs(latKey * 13 + lngKey * 23)
}

function buildMockTraffic({ lat, lng }: MapCoordinates, source: string): TrafficSnapshot {
  const seed = hashCoordinates(lat, lng)
  const states: TrafficSnapshot['condition'][] = ['light', 'moderate', 'heavy', 'severe']
  const condition = states[seed % states.length]
  const descriptions = {
    light: 'Free-flowing traffic with short signal delays.',
    moderate: 'Typical urban congestion with intermittent slowdowns.',
    heavy: 'Recurring bottlenecks near junctions and bus stops.',
    severe: 'Stop-and-go movement with frequent queue spillback.',
  } as const

  return {
    locationName: locationLabel(lat, lng),
    condition,
    description: descriptions[condition],
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
