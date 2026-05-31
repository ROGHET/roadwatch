import type { WeatherProvider, WeatherSnapshot } from './types'

function nowIso() {
  return new Date().toISOString()
}

function locationLabel(lat: number, lng: number): string {
  const roundedLat = lat.toFixed(3)
  const roundedLng = lng.toFixed(3)
  return `Map corridor (${roundedLat}, ${roundedLng})`
}

function buildMockWeather(lat: number, lng: number, source: string): WeatherSnapshot {
  return {
    locationName: locationLabel(lat, lng),
    temperatureC: 'Data unavailable',
    condition: 'Data unavailable',
    humidityPercent: 'Data unavailable',
    windSpeedKph: 'Data unavailable',
    visibilityKm: 'Data unavailable',
    rainProbabilityPercent: 'Data unavailable',
    source,
    observedAt: nowIso(),
  }
}

export const mockWeatherProvider: WeatherProvider = {
  id: 'mock-weather',
  label: 'Mock weather provider',
  async getWeather({ lat, lng }) {
    return buildMockWeather(lat, lng, 'Mock weather provider')
  },
}

function parseOpenWeatherCondition(code?: number): string {
  if (typeof code !== 'number') return 'Clear'
  if (code >= 200 && code < 300) return 'Thunderstorm'
  if (code >= 300 && code < 400) return 'Drizzle'
  if (code >= 500 && code < 600) return 'Rain'
  if (code >= 600 && code < 700) return 'Snow'
  if (code === 701) return 'Mist'
  if (code === 711) return 'Smoke'
  if (code === 721) return 'Haze'
  if (code === 731 || code === 761 || code === 751) return 'Dust'
  if (code === 800) return 'Clear'
  if (code === 801) return 'Few clouds'
  if (code === 802) return 'Partly cloudy'
  return 'Overcast'
}

export function createOpenWeatherProvider(apiKey: string): WeatherProvider {
  return {
    id: 'openweather',
    label: 'OpenWeather',
    async getWeather({ lat, lng }) {
      const url = new URL('https://api.openweathermap.org/data/2.5/weather')
      url.searchParams.set('lat', String(lat))
      url.searchParams.set('lon', String(lng))
      url.searchParams.set('units', 'metric')
      url.searchParams.set('appid', apiKey)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('OpenWeather request failed')
      }

      const payload = (await response.json()) as {
        name?: string
        weather?: Array<{ id?: number; description?: string }>
        main?: { temp?: number; humidity?: number }
        wind?: { speed?: number }
        visibility?: number
        rain?: { '1h'?: number }
        clouds?: { all?: number }
      }

      const visibilityKm = Number((((payload.visibility ?? 0) / 1000) || 10).toFixed(1))
      const rainProbabilityPercent = Math.min(
        100,
        Math.round(
          payload.rain?.['1h'] ? 80 : payload.clouds?.all ?? 30,
        ),
      )

      return {
        locationName: payload.name?.trim() || locationLabel(lat, lng),
        temperatureC: Math.round(payload.main?.temp ?? 0),
        condition: payload.weather?.[0]?.description ?? parseOpenWeatherCondition(payload.weather?.[0]?.id),
        humidityPercent: Math.round(payload.main?.humidity ?? 0),
        windSpeedKph: Math.round((payload.wind?.speed ?? 0) * 3.6),
        visibilityKm,
        rainProbabilityPercent,
        source: 'OpenWeather',
        observedAt: nowIso(),
      }
    },
  }
}

export function createOpenMeteoProvider(): WeatherProvider {
  return {
    id: 'open-meteo',
    label: 'Open-Meteo',
    async getWeather({ lat, lng }) {
      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.searchParams.set('latitude', String(lat))
      url.searchParams.set('longitude', String(lng))
      url.searchParams.set(
        'current',
        'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
      )
      url.searchParams.set('temperature_unit', 'celsius')
      url.searchParams.set('wind_speed_unit', 'kmh')
      url.searchParams.set('timezone', 'auto')

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Open-Meteo request failed')
      }

      const payload = (await response.json()) as {
        current?: {
          temperature_2m?: number
          weather_code?: number
          relative_humidity_2m?: number
          wind_speed_10m?: number
          visibility?: number
        }
        hourly?: {
          rain?: number[]
          precipitation_probability?: number[]
        }
      }

      const current = payload.current ?? {}
      const visibilityKm = Number((((current.visibility ?? 0) / 1000) || 10).toFixed(1))
      const rainProbabilityPercent = Math.min(
        100,
        Math.round(
          payload.hourly?.precipitation_probability?.[0] ??
            (current.weather_code && current.weather_code >= 51 ? 70 : 18),
        ),
      )

      return {
        locationName: locationLabel(lat, lng),
        temperatureC: Math.round(current.temperature_2m ?? 0),
        condition: parseOpenWeatherCondition(current.weather_code),
        humidityPercent: Math.round(current.relative_humidity_2m ?? 0),
        windSpeedKph: Math.round(current.wind_speed_10m ?? 0),
        visibilityKm,
        rainProbabilityPercent,
        source: 'Open-Meteo',
        observedAt: nowIso(),
      }
    },
  }
}

export function resolveWeatherProvider(env: ImportMetaEnv): WeatherProvider {
  const provider = env.VITE_MAP_WEATHER_PROVIDER?.trim().toLowerCase()
  const openWeatherKey = env.VITE_OPENWEATHER_API_KEY?.trim()

  if (provider === 'openweather' && openWeatherKey) {
    return createOpenWeatherProvider(openWeatherKey)
  }

  if (provider === 'open-meteo') {
    return createOpenMeteoProvider()
  }

  if (openWeatherKey) {
    return createOpenWeatherProvider(openWeatherKey)
  }

  return mockWeatherProvider
}
