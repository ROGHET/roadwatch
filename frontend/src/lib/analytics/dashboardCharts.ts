import { accidentRecords, crifBudgetRecords, tenderComplianceRecords } from '../../data/realDatasets'
import { mockComplaintRecords } from '../../data/complaints'
import {
  contractAwardRecords,
  getProcurementMethodStats,
  getTopContractorsByValue,
  roadContractAwards,
} from '../../data/contractAwards'
import { tollPlazaRecords } from '../../data/tollPlazas'
import { getAccidentHotspots } from './riskEngine'

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

export function getRiskHotspotChartData() {
  return getAccidentHotspots(10).map((row, index) => ({
    label: row.label,
    riskScore: row.riskScore,
    color: chartColors[index % chartColors.length],
  }))
}

export function getContractorValueChartData() {
  return getTopContractorsByValue(8).map((row, index) => ({
    contractor: row.contractor.length > 18 ? `${row.contractor.slice(0, 18)}…` : row.contractor,
    valueMillionUsd: Number((row.value / 1_000_000).toFixed(2)),
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
  for (const toll of tollPlazaRecords) {
    const key = toll.state ?? 'Unknown'
    byState.set(key, (byState.get(key) ?? 0) + 1)
  }
  return {
    totalPlazas: tollPlazaRecords.length,
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
