/** Snapshot for map location intelligence (weather + air quality). */
export type LocationWeatherSnapshot = {
  locationName: string
  temperatureC: number
  condition: string
  aqi: number
  aqiLabel: string
  humidityPercent: number
  windSpeedKph: number
}

export type LocationIntelligenceRequest = {
  lat: number
  lng: number
}

/** Contract for future weather / AQI API integrations. */
export interface LocationIntelligenceProvider {
  getSnapshot(request: LocationIntelligenceRequest): Promise<LocationWeatherSnapshot>
}

const conditionCatalog = [
  'Clear',
  'Partly cloudy',
  'Overcast',
  'Light rain',
  'Haze',
  'Mist',
] as const

const placeNames = [
  'Corridor Sector',
  'Junction Block',
  'Service Lane',
  'Ring Segment',
  'NH Stretch',
  'Urban Arterial',
] as const

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

/** Deterministic mock provider for demo and interface validation. */
export const mockLocationIntelligenceProvider: LocationIntelligenceProvider = {
  async getSnapshot({ lat, lng }) {
    const seed = hashCoordinates(lat, lng)

    const aqi = 40 + (seed % 220)
    const temperatureC = 22 + (seed % 14)
    const humidityPercent = 35 + (seed % 55)
    const windSpeedKph = 4 + (seed % 28)

    return {
      locationName: `${placeNames[seed % placeNames.length]} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      temperatureC,
      condition: conditionCatalog[seed % conditionCatalog.length],
      aqi,
      aqiLabel: aqiLabelFor(aqi),
      humidityPercent,
      windSpeedKph,
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
  return getLocationIntelligenceProvider().getSnapshot({ lat, lng })
}
