import type { AQIProvider, AirQualitySnapshot } from './types'

function nowIso() {
  return new Date().toISOString()
}

function locationLabel(lat: number, lng: number): string {
  return `Air quality corridor (${lat.toFixed(3)}, ${lng.toFixed(3)})`
}

function aqiLabelFor(value: number): string {
  if (value <= 50) return 'Good'
  if (value <= 100) return 'Moderate'
  if (value <= 150) return 'Unhealthy for sensitive groups'
  if (value <= 200) return 'Unhealthy'
  if (value <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function buildMockAQI(lat: number, lng: number, source: string): AirQualitySnapshot {
  return {
    locationName: locationLabel(lat, lng),
    aqi: 'Data unavailable',
    aqiLabel: 'Data unavailable',
    source,
    observedAt: nowIso(),
  }
}

export const mockAqiProvider: AQIProvider = {
  id: 'mock-aqi',
  label: 'Mock AQI provider',
  async getAQI({ lat, lng }) {
    return buildMockAQI(lat, lng, 'Mock AQI provider')
  },
}

export function createAqicnProvider(token: string): AQIProvider {
  return {
    id: 'aqicn',
    label: 'AQICN',
    async getAQI({ lat, lng }) {
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`)
      if (!response.ok) {
        throw new Error('AQICN request failed')
      }

      const payload = (await response.json()) as {
        status?: string
        data?: { aqi?: number; city?: { name?: string } }
      }

      if (payload.status !== 'ok') {
        throw new Error('AQICN returned an error response')
      }

      const aqi = Number(payload.data?.aqi ?? 0)
      return {
        locationName: payload.data?.city?.name?.trim() || locationLabel(lat, lng),
        aqi,
        aqiLabel: aqiLabelFor(aqi),
        source: 'AQICN',
        observedAt: nowIso(),
      }
    },
  }
}

export function createWaqiProvider(token: string): AQIProvider {
  return {
    id: 'waqi',
    label: 'WAQI',
    async getAQI({ lat, lng }) {
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`)
      if (!response.ok) {
        throw new Error('WAQI request failed')
      }

      const payload = (await response.json()) as {
        status?: string
        data?: { aqi?: number; city?: { name?: string } }
      }

      if (payload.status !== 'ok') {
        throw new Error('WAQI returned an error response')
      }

      const aqi = Number(payload.data?.aqi ?? 0)
      return {
        locationName: payload.data?.city?.name?.trim() || locationLabel(lat, lng),
        aqi,
        aqiLabel: aqiLabelFor(aqi),
        source: 'WAQI',
        observedAt: nowIso(),
      }
    },
  }
}

export function resolveAqiProvider(env: ImportMetaEnv): AQIProvider {
  const provider = env.VITE_MAP_AQI_PROVIDER?.trim().toLowerCase()
  const aqicnKey = env.VITE_AQICN_API_KEY?.trim()
  const waqiKey = env.VITE_WAQI_API_KEY?.trim()

  if (provider === 'aqicn' && aqicnKey) {
    return createAqicnProvider(aqicnKey)
  }

  if (provider === 'waqi' && waqiKey) {
    return createWaqiProvider(waqiKey)
  }

  if (aqicnKey) {
    return createAqicnProvider(aqicnKey)
  }

  if (waqiKey) {
    return createWaqiProvider(waqiKey)
  }

  return mockAqiProvider
}
