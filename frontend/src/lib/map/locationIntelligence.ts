import { getAqiProvider, getTrafficProvider, getWeatherProvider } from './providers/registry'
import { inferPlaceFromCoordinates } from './inferPlace'

/** Snapshot for map location intelligence (weather + air quality + traffic). */
export type LocationWeatherSnapshot = {
  locationName: string
  city: string
  state: string
  temperatureC: number
  condition: string
  aqi: number
  aqiLabel: string
  humidityPercent: number
  windSpeedKph: number
  visibilityKm: number
  rainProbabilityPercent: number
  trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe'
  trafficDescription: string
  observedAt: string
}

export type LocationIntelligenceRequest = {
  lat: number
  lng: number
}

/** Contract for map intelligence providers. */
export interface LocationIntelligenceProvider {
  getSnapshot(request: LocationIntelligenceRequest): Promise<LocationWeatherSnapshot>
}

const conditionCatalog = ['Clear', 'Partly cloudy', 'Overcast', 'Light rain', 'Haze', 'Mist'] as const

function hashCoordinates(lat: number, lng: number): number {
  const latKey = Math.round(lat * 100)
  const lngKey = Math.round(lng * 100)
  return Math.abs(latKey * 31 + lngKey * 17)
}

function aqiLabelFor(value: number): string {
  if (value <= 50) return 'Good'
  if (value <= 100) return 'Moderate'
  if (value <= 200) return 'Unhealthy for sensitive groups'
  if (value <= 300) return 'Unhealthy'
  return 'Hazardous'
}

function buildMockSnapshot(lat: number, lng: number): LocationWeatherSnapshot {
  const seed = hashCoordinates(lat, lng)
  const place = inferPlaceFromCoordinates(lat, lng)
  const aqi = 40 + (seed % 220)
  const trafficCondition = ['light', 'moderate', 'heavy', 'severe'][seed % 4] as LocationWeatherSnapshot['trafficCondition']
  const trafficDescriptionByCondition: Record<LocationWeatherSnapshot['trafficCondition'], string> = {
    light: 'Free-flowing traffic with short signal delays.',
    moderate: 'Typical urban congestion with intermittent slowdowns.',
    heavy: 'Recurring bottlenecks near junctions and bus stops.',
    severe: 'Stop-and-go movement with frequent queue spillback.',
  }

  return {
    locationName: `${place.label} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    city: place.city,
    state: place.state,
    temperatureC: 22 + (seed % 14),
    condition: conditionCatalog[seed % conditionCatalog.length],
    aqi,
    aqiLabel: aqiLabelFor(aqi),
    humidityPercent: 35 + (seed % 55),
    windSpeedKph: 4 + (seed % 28),
    visibilityKm: Number((4 + (seed % 12) * 0.75).toFixed(1)),
    rainProbabilityPercent: Math.min(100, 8 + (seed % 72)),
    trafficCondition,
    trafficDescription: trafficDescriptionByCondition[trafficCondition],
    observedAt: new Date().toISOString(),
  }
}

/** Deterministic mock provider for demo and interface validation. */
export const mockLocationIntelligenceProvider: LocationIntelligenceProvider = {
  async getSnapshot({ lat, lng }) {
    const [weather, airQuality, traffic] = await Promise.all([
      getWeatherProvider().getWeather({ lat, lng }),
      getAqiProvider().getAQI({ lat, lng }),
      getTrafficProvider().getTraffic({ lat, lng }),
    ])

    const place = inferPlaceFromCoordinates(lat, lng)

    return {
      locationName:
        weather.locationName || airQuality.locationName || traffic.locationName || place.label,
      city: place.city,
      state: place.state,
      temperatureC: weather.temperatureC,
      condition: weather.condition,
      aqi: airQuality.aqi,
      aqiLabel: airQuality.aqiLabel,
      humidityPercent: weather.humidityPercent,
      windSpeedKph: weather.windSpeedKph,
      visibilityKm: weather.visibilityKm,
      rainProbabilityPercent: weather.rainProbabilityPercent,
      trafficCondition: traffic.condition,
      trafficDescription: traffic.description,
      observedAt: traffic.observedAt || weather.observedAt || airQuality.observedAt,
    }
  },
}

let activeProvider: LocationIntelligenceProvider = mockLocationIntelligenceProvider

export function getLocationIntelligenceProvider(): LocationIntelligenceProvider {
  return activeProvider
}

export function setLocationIntelligenceProvider(provider: LocationIntelligenceProvider): void {
  activeProvider = provider
}

export async function fetchLocationIntelligence(
  lat: number,
  lng: number,
): Promise<LocationWeatherSnapshot> {
  try {
    return await getLocationIntelligenceProvider().getSnapshot({ lat, lng })
  } catch {
    return buildMockSnapshot(lat, lng)
  }
}
