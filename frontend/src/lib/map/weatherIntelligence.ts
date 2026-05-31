import { getWeatherProvider } from './providers/registry'
import type { MapCoordinates } from './providers/types'
import type { WeatherRiskInput } from '../analytics/riskEngine'
import { getCachedIntelligence, setCachedIntelligence } from './intelligenceCache'

export type ExtendedWeatherIntelligence = {
  rainfallMm: number | string
  visibilityKm: number | string
  alerts: string[]
  warnings: string[]
  floodRisk: number
  condition: string
  temperatureC: number | string
  humidityPercent: number | string
  windSpeedKph: number | string
  rainProbabilityPercent: number
  source: string
  observedAt: string
}

function computeFloodRisk(rainMm: number, visibilityKm: number, rainProbability: number): number {
  let risk = 0
  if (rainMm >= 20) risk += 45
  else if (rainMm >= 8) risk += 28
  else if (rainMm >= 2) risk += 12
  if (visibilityKm < 1) risk += 35
  else if (visibilityKm < 3) risk += 20
  risk += Math.min(30, rainProbability * 0.3)
  return Math.min(100, Math.round(risk))
}

function buildWarnings(
  rainProbability: number,
  visibilityKm: number,
  condition: string,
): string[] {
  const warnings: string[] = []
  if (rainProbability >= 70) warnings.push('Heavy rainfall likely on corridor')
  else if (rainProbability >= 45) warnings.push('Rain may reduce road grip')
  if (visibilityKm < 3) warnings.push('Low visibility — reduce speed')
  if (/thunder|storm/i.test(condition)) warnings.push('Thunderstorm alert for corridor')
  return warnings
}

export async function fetchExtendedWeatherIntelligence(
  request: MapCoordinates,
): Promise<ExtendedWeatherIntelligence> {
  const cached = getCachedIntelligence<ExtendedWeatherIntelligence>(
    request.lat,
    request.lng,
    'weather-extended',
  )
  if (cached) return cached

  const provider = getWeatherProvider()
  const snapshot = await provider.getWeather(request)
  const rainProbability =
    typeof snapshot.rainProbabilityPercent === 'number'
      ? snapshot.rainProbabilityPercent
      : 0
  const visibilityKm =
    typeof snapshot.visibilityKm === 'number' ? snapshot.visibilityKm : 10
  const rainfallMm =
    rainProbability >= 60 ? Math.round(rainProbability * 0.35) : rainProbability >= 30 ? 2 : 0
  const floodRisk = computeFloodRisk(rainfallMm, visibilityKm, rainProbability)
  const warnings = buildWarnings(rainProbability, visibilityKm, String(snapshot.condition))
  const alerts = warnings.length > 0 ? warnings : []

  return setCachedIntelligence(request.lat, request.lng, 'weather-extended', {
    rainfallMm,
    visibilityKm: snapshot.visibilityKm,
    alerts,
    warnings,
    floodRisk,
    condition: snapshot.condition,
    temperatureC: snapshot.temperatureC,
    humidityPercent: snapshot.humidityPercent,
    windSpeedKph: snapshot.windSpeedKph,
    rainProbabilityPercent: rainProbability,
    source: snapshot.source,
    observedAt: snapshot.observedAt,
  })
}

export function toWeatherRiskInput(intel: ExtendedWeatherIntelligence): WeatherRiskInput {
  return {
    rainProbabilityPercent: intel.rainProbabilityPercent,
    visibilityKm: typeof intel.visibilityKm === 'number' ? intel.visibilityKm : 10,
    alerts: intel.alerts,
    floodRisk: intel.floodRisk,
  }
}
