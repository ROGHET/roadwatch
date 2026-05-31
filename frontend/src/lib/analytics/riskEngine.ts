import {
  accidentRecords,
  bmcRoadBudgetRecords,
  crifBudgetRecords,
  roadWorkRecords,
  tenderComplianceRecords,
  type AccidentDatasetRecord,
} from '../../data/realDatasets'
import type { RoadScoreTier } from '../../components/road/RoadScoreBadge'
import type { RiskLevel } from '../../components/road/RiskIndicator'

export type WeatherRiskInput = {
  rainProbabilityPercent: number
  visibilityKm: number
  alerts?: string[]
  floodRisk?: number
}

export type RoadRiskContext = {
  state?: string
  city?: string
  highwayType?: string
  complaintPressure?: number
  weather?: WeatherRiskInput
}

export type CompositeHealthResult = {
  score: number
  tier: RoadScoreTier | 'critical'
  factors: {
    accident: number
    complaint: number
    budget: number
    tender: number
    weather: number
  }
}

export type RoadRiskResult = {
  score: number
  level: RiskLevel
  color: 'green' | 'yellow' | 'orange' | 'red'
  factors: CompositeHealthResult['factors']
}

export type RiskHotspot = {
  id: string
  label: string
  state: string
  riskScore: number
  level: RiskLevel
  deaths: number
  accidents: number
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function normalizeTier(score: number): RoadScoreTier | 'critical' {
  if (score >= 80) return 'excellent'
  if (score >= 65) return 'good'
  if (score >= 50) return 'fair'
  if (score >= 35) return 'poor'
  return 'critical'
}

function normalizeRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'low'
  if (score < 50) return 'medium'
  if (score < 75) return 'high'
  return 'critical'
}

function riskColor(score: number): RoadRiskResult['color'] {
  if (score < 25) return 'green'
  if (score < 50) return 'yellow'
  if (score < 75) return 'orange'
  return 'red'
}

function matchAccidentRecord(state?: string, city?: string): AccidentDatasetRecord | undefined {
  const needle = (city ?? state ?? '').toLowerCase()
  if (!needle) return undefined
  return accidentRecords.find((row) => {
    const label = row.stateOrCity.toLowerCase()
    return label === needle || label.includes(needle) || needle.includes(label)
  })
}

function accidentPressure(state?: string, city?: string): number {
  const match = matchAccidentRecord(state, city)
  if (!match) {
    const national = accidentRecords.reduce(
      (sum, row) => sum + row.roadAccidents + row.deaths,
      0,
    )
    const avg = national / Math.max(1, accidentRecords.length)
    return clamp((avg / 5000) * 100)
  }
  const weighted = match.roadAccidents * 0.6 + match.deaths * 2 + match.injured * 0.2
  return clamp((weighted / 8000) * 100)
}

function complaintPressure(state?: string): number {
  const tnWorks = roadWorkRecords.length
  const grievanceBudget = bmcRoadBudgetRecords[0]?.sanctionedThousand ?? 0
  const stateWorks = roadWorkRecords.filter((work) =>
    state ? work.district.toLowerCase().includes(state.toLowerCase()) : true,
  ).length
  const worksFactor = clamp((stateWorks / Math.max(1, tnWorks)) * 70 + stateWorks * 2)
  const bmcFactor = state?.toLowerCase().includes('maharashtra')
    ? clamp((grievanceBudget / 200000) * 100)
    : 0
  return clamp(worksFactor * 0.7 + bmcFactor * 0.3)
}

function budgetAnomalyScore(): number {
  const ratios = crifBudgetRecords.map((row) => {
    if (row.sanctionedCrore <= 0) return 0
    const releaseRatio = row.releasedCrore / row.sanctionedCrore
    return Math.abs(1 - releaseRatio)
  })
  const avgGap = ratios.reduce((sum, value) => sum + value, 0) / Math.max(1, ratios.length)
  return clamp(avgGap * 120)
}

function tenderComplianceRisk(): number {
  const totals = tenderComplianceRecords.reduce(
    (acc, row) => {
      acc.evaluated += row.tendersEvaluated
      acc.nonCompliant += row.nonCompliantTenders
      return acc
    },
    { evaluated: 0, nonCompliant: 0 },
  )
  if (totals.evaluated <= 0) return 0
  return clamp((totals.nonCompliant / totals.evaluated) * 100)
}

function weatherRiskScore(weather?: WeatherRiskInput): number {
  if (!weather) return 0
  const rain = clamp(weather.rainProbabilityPercent)
  const visibilityPenalty = weather.visibilityKm < 2 ? 40 : weather.visibilityKm < 5 ? 25 : 0
  const alertPenalty = (weather.alerts?.length ?? 0) * 12
  const flood = clamp(weather.floodRisk ?? 0)
  return clamp(rain * 0.45 + visibilityPenalty + alertPenalty + flood * 0.35)
}

export function computeCompositeHealth(context: RoadRiskContext = {}): CompositeHealthResult {
  const accident = accidentPressure(context.state, context.city)
  const complaint = context.complaintPressure ?? complaintPressure(context.state)
  const budget = budgetAnomalyScore()
  const tender = tenderComplianceRisk()
  const weather = weatherRiskScore(context.weather)

  const rawRisk =
    accident * 0.28 +
    complaint * 0.22 +
    budget * 0.18 +
    tender * 0.12 +
    weather * 0.2

  const score = clamp(100 - rawRisk)
  return {
    score: Math.round(score),
    tier: normalizeTier(score),
    factors: {
      accident: Math.round(accident),
      complaint: Math.round(complaint),
      budget: Math.round(budget),
      tender: Math.round(tender),
      weather: Math.round(weather),
    },
  }
}

export function computeRoadRisk(context: RoadRiskContext = {}): RoadRiskResult {
  const health = computeCompositeHealth(context)
  const riskScore = clamp(100 - health.score)
  return {
    score: Math.round(riskScore),
    level: normalizeRiskLevel(riskScore),
    color: riskColor(riskScore),
    factors: health.factors,
  }
}

function accidentHotspotRawScore(row: AccidentDatasetRecord): number {
  return row.roadAccidents * 0.5 + row.deaths * 3
}

const accidentHotspotBounds = (() => {
  const rawScores = accidentRecords.map(accidentHotspotRawScore)
  return {
    min: Math.min(...rawScores),
    max: Math.max(...rawScores),
  }
})()

function normalizeHotspotScore(raw: number): number {
  const { min, max } = accidentHotspotBounds
  if (max <= min) return 50
  return clamp(((raw - min) / (max - min)) * 100)
}

export function getAccidentHotspots(limit = 12): RiskHotspot[] {
  return accidentRecords
    .map((row) => {
      const riskScore = normalizeHotspotScore(accidentHotspotRawScore(row))
      return {
        id: row.id,
        label: row.stateOrCity,
        state: row.stateOrCity,
        riskScore: Math.round(riskScore),
        level: normalizeRiskLevel(riskScore),
        deaths: row.deaths,
        accidents: row.roadAccidents,
      }
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit)
}

export function mapHighwayType(highway?: string): string {
  if (!highway) return 'Urban Road'
  const normalized = highway.toLowerCase()
  if (normalized.includes('motorway') || normalized.includes('trunk')) return 'NH'
  if (normalized.includes('primary') || normalized.includes('secondary')) return 'SH'
  if (normalized.includes('tertiary')) return 'MDR'
  return 'ODR'
}
