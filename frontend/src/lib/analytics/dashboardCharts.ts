import {
  accidentRecords,
  crifBudgetRecords,
  tenderComplianceRecords,
} from '../../data/realDatasets'
import { mapRoadMarkers } from '../../data/mapMarkers'
import { mockComplaintRecords } from '../../data/complaints'
import {
  contractAwardRecords,
  getProcurementMethodStats,
  getTopContractorsByValue,
  roadContractAwards,
} from '../../data/contractAwards'
import { tollPlazaRecords } from '../../data/tollPlazas'
import { formatAwardInr, usdToInr } from '../currency/formatInr'
import { getAccidentHotspots } from './riskEngine'
import { getComplaintDashboardMetrics } from './complaintMetrics'

/** Road quality tier breakdown uses mapRoadMarkers score data (real mock dataset). */
export const SURFACE_QUALITY_DATASET_AVAILABLE = true

export const chartTooltipStyle = {
  contentStyle: {
    background: 'rgba(20, 20, 20, 0.95)',
    border: '1px solid #4A8DFF',
    color: '#FFFFFF',
    borderRadius: '8px',
  },
  labelStyle: { color: '#FFFFFF' },
  itemStyle: { color: '#FFFFFF' },
}

const chartColors = [
  '#38bdf8',
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
  '#eab308',
  '#64748b',
]

export function getAccidentChartData(limit = 10) {
  return accidentRecords
    .slice()
    .sort((a, b) => b.deaths - a.deaths)
    .slice(0, limit)
    .map((row) => ({
      label: row.stateOrCity,
      accidents: row.roadAccidents,
      deaths: row.deaths,
      injured: row.injured,
    }))
}

export function getComplaintIssueChartData() {
  const counts = new Map<string, number>()
  for (const record of mockComplaintRecords) {
    const key = record.issueType
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count], index) => ({
      label,
      count,
      color: chartColors[index % chartColors.length],
    }))
}

export function getComplaintResolutionChartData(
  submittedComplaints: Parameters<typeof getComplaintDashboardMetrics>[0] = [],
) {
  const metrics = getComplaintDashboardMetrics(submittedComplaints)
  return [
    { label: 'Closed', count: metrics.closed, color: '#22c55e' },
    { label: 'In Progress', count: metrics.inProgress, color: '#38bdf8' },
    { label: 'Pending', count: metrics.pending, color: '#f59e0b' },
  ]
}

export function getBudgetTrendChartData() {
  return crifBudgetRecords.map((row) => ({
    year: row.year,
    sanctioned: row.sanctionedCrore,
    released: row.releasedCrore,
    remaining: row.remainingCrore,
  }))
}

export function getTenderComplianceChartData() {
  return tenderComplianceRecords.slice(0, 8).map((row, index) => ({
    ministry: row.ministry.length > 22 ? `${row.ministry.slice(0, 22)}…` : row.ministry,
    evaluated: row.tendersEvaluated,
    nonCompliant: row.nonCompliantTenders,
    color: chartColors[index % chartColors.length],
  }))
}

const riskHotspotColors = ['#ef4444', '#f97316', '#fbbf24', '#38bdf8', '#22c55e']

export function getRiskHotspotChartData() {
  return getAccidentHotspots(10).map((row, index) => ({
    label: row.label,
    riskScore: row.riskScore,
    color:
      row.riskScore >= 75
        ? '#ef4444'
        : row.riskScore >= 50
          ? '#f97316'
          : row.riskScore >= 25
            ? '#fbbf24'
            : riskHotspotColors[index % riskHotspotColors.length],
  }))
}

export function getContractorValueChartData() {
  return getTopContractorsByValue(8).map((row, index) => ({
    contractor: row.contractor.length > 18 ? `${row.contractor.slice(0, 18)}…` : row.contractor,
    valueLabel: formatAwardInr(row.value),
    valueInr: usdToInr(row.value),
    projects: row.projects,
    color: chartColors[index % chartColors.length],
  }))
}

export function getProcurementChartData() {
  return getProcurementMethodStats().slice(0, 6).map((row, index) => ({
    method: row.method.length > 20 ? `${row.method.slice(0, 20)}…` : row.method,
    count: row.count,
    color: chartColors[index % chartColors.length],
  }))
}

export function getTollAnalytics() {
  const byState = new Map<string, number>()
  let excludedUnknown = 0
  for (const toll of tollPlazaRecords) {
    const key = toll.state?.trim()
    if (!key) {
      excludedUnknown += 1
      continue
    }
    byState.set(key, (byState.get(key) ?? 0) + 1)
  }
  return {
    totalPlazas: tollPlazaRecords.length,
    excludedWithoutState: excludedUnknown,
    byState: Array.from(byState.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([state, count], index) => ({
        state,
        count,
        color: chartColors[index % chartColors.length],
      })),
  }
}

export function getRoadContractSummary() {
  return {
    totalAwards: contractAwardRecords.length,
    roadRelatedAwards: roadContractAwards.length,
    totalValueUsd: roadContractAwards.reduce((sum, row) => sum + row.awardValueUsd, 0),
  }
}

export function getBudgetUtilizationSummary() {
  const totals = crifBudgetRecords.reduce(
    (acc, row) => {
      acc.sanctioned += row.sanctionedCrore
      acc.released += row.releasedCrore
      const utilized = row.releasedCrore - row.remainingCrore
      acc.utilized += Math.max(0, utilized)
      return acc
    },
    { sanctioned: 0, released: 0, utilized: 0 },
  )
  return totals
}

export function getRoadQualityTierBreakdown() {
  if (!SURFACE_QUALITY_DATASET_AVAILABLE) {
    return []
  }

  const tiers = {
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Poor: 0,
    Critical: 0,
  }

  for (const road of mapRoadMarkers) {
    if (road.score >= 80) tiers.Excellent += 1
    else if (road.score >= 65) tiers.Good += 1
    else if (road.score >= 50) tiers.Fair += 1
    else if (road.score >= 35) tiers.Poor += 1
    else tiers.Critical += 1
  }

  return Object.entries(tiers).map(([label, count], index) => ({
    label,
    count,
    color: chartColors[index % chartColors.length],
  }))
}

export function getBudgetVsRoadQualityChartData(limit = 8) {
  const nationalBudget = getBudgetUtilizationSummary()
  const hotspots = getAccidentHotspots(limit)

  return hotspots.map((hotspot, index) => {
    const crifRow = crifBudgetRecords[index % Math.max(1, crifBudgetRecords.length)]
    const sanctioned = crifRow?.sanctionedCrore ?? nationalBudget.sanctioned / hotspots.length
    const released = crifRow?.releasedCrore ?? nationalBudget.released / hotspots.length
    const utilized = Math.max(0, released - (crifRow?.remainingCrore ?? 0))
    const roadQuality = Math.max(0, 100 - hotspot.riskScore)
    return {
      state: hotspot.label.length > 16 ? `${hotspot.label.slice(0, 16)}…` : hotspot.label,
      sanctioned: Number(sanctioned.toFixed(1)),
      released: Number(released.toFixed(1)),
      utilized: Number(utilized.toFixed(1)),
      roadQuality,
      highBudgetPoorQuality: sanctioned > 100 && roadQuality < 50,
      color: chartColors[index % chartColors.length],
    }
  })
}
