import { getAqiProvider, getTrafficProvider, getWeatherProvider } from './providers/registry'
import { inferPlaceFromCoordinates } from './inferPlace'
import { mapRoadMarkers } from '../../data/mapMarkers'

/** Snapshot for map location intelligence (weather + air quality + traffic). */
export type LocationWeatherSnapshot = {
  locationName: string
  city: string
  state: string
  temperatureC: number | string
  condition: string
  aqi: number | string
  aqiLabel: string
  humidityPercent: number | string
  windSpeedKph: number | string
  visibilityKm: number | string
  rainProbabilityPercent: number | string
  trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe'
  trafficDescription: string
  roadType?: string
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

function buildUnavailableSnapshot(lat: number, lng: number): LocationWeatherSnapshot {
  const place = inferPlaceFromCoordinates(lat, lng)

  return {
    locationName: `${place.label} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    city: place.city,
    state: place.state,
    temperatureC: 'Data unavailable',
    condition: 'Data unavailable',
    aqi: 'Data unavailable',
    aqiLabel: 'Data unavailable',
    humidityPercent: 'Data unavailable',
    windSpeedKph: 'Data unavailable',
    visibilityKm: 'Data unavailable',
    rainProbabilityPercent: 'Data unavailable',
    trafficCondition: 'moderate',
    trafficDescription: 'Data unavailable',
    roadType: findNearestRoadType(lat, lng),
    observedAt: new Date().toISOString(),
  }
}

function distanceSquared(latA: number, lngA: number, latB: number, lngB: number): number {
  return (latA - latB) ** 2 + (lngA - lngB) ** 2
}

function findNearestRoadType(lat: number, lng: number): string | undefined {
  const nearest = mapRoadMarkers.reduce<{
    roadType?: string
    distance: number
  } | null>((closest, road) => {
    if (!road.roadType) return closest
    const distance = distanceSquared(lat, lng, road.lat, road.lng)
    if (!closest || distance < closest.distance) {
      return { roadType: road.roadType, distance }
    }
    return closest
  }, null)

  return nearest && nearest.distance <= 0.02 ? nearest.roadType : undefined
}

/** Provider facade. Values stay unavailable unless configured providers return real data. */
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
      roadType: findNearestRoadType(lat, lng),
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
    return buildUnavailableSnapshot(lat, lng)
  }
}
