import { mockComplaintRecords } from '../../data/complaints'
import { roadBudgetById } from '../../data/mapRoadBudget'

export type CategoryStat = {
  label: string
  count: number
  color: string
}

export type StatusStat = {
  label: string
  count: number
  color: string
}

export type MonthlyTrendStat = {
  month: string
  count: number
}

export type BudgetUtilizationStat = {
  allocatedCr: number
  spentCr: number
  remainingCr: number
  utilizationPercent: number
}

const categoryColors = [
  'var(--st-error)',
  'var(--st-secondary)',
  'var(--st-primary)',
  'var(--st-tertiary)',
  '#a855f7',
  '#f59e0b',
  '#06b6d4',
  '#64748b',
]

const statusColors: Record<string, string> = {
  resolved: 'var(--st-tertiary)',
  pending: 'var(--st-secondary)',
  routed: 'var(--st-primary)',
  in_review: '#f59e0b',
  rejected: 'var(--st-error)',
}

function parseCr(value: string): number {
  const match = value.match(/([\d.]+)/)
  return match ? Number.parseFloat(match[1]) : 0
}

export function getComplaintCategoryStats(): CategoryStat[] {
  const counts = new Map<string, number>()
  mockComplaintRecords.forEach((record) => {
    const key = record.issueType.replace(/\b\w/g, (char) => char.toUpperCase())
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count], index) => ({
      label,
      count,
      color: categoryColors[index % categoryColors.length],
    }))
}

export function getResolutionStatusStats(): StatusStat[] {
  const counts = new Map<string, number>()
  mockComplaintRecords.forEach((record) => {
    const key = record.status
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label: label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      count,
      color: statusColors[label] ?? 'var(--st-on-surface-variant)',
    }))
}

export function getMonthlyTrendStats(): MonthlyTrendStat[] {
  const counts = new Map<string, number>()
  mockComplaintRecords.forEach((record) => {
    const month = record.reportedAt?.split(' ')[1] ?? 'Unknown'
    counts.set(month, (counts.get(month) ?? 0) + 1)
  })

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return monthOrder
    .filter((month) => counts.has(month))
    .map((month) => ({ month, count: counts.get(month) ?? 0 }))
}

export function getBudgetUtilizationStats(): BudgetUtilizationStat {
  const totals = Object.values(roadBudgetById).reduce(
    (accumulator, entry) => ({
      allocatedCr: accumulator.allocatedCr + parseCr(entry.sanctioned),
      spentCr: accumulator.spentCr + parseCr(entry.spent),
    }),
    { allocatedCr: 0, spentCr: 0 },
  )

  const remainingCr = Math.max(0, totals.allocatedCr - totals.spentCr)
  const utilizationPercent =
    totals.allocatedCr > 0 ? Math.round((totals.spentCr / totals.allocatedCr) * 100) : 0

  return {
    allocatedCr: totals.allocatedCr,
    spentCr: totals.spentCr,
    remainingCr,
    utilizationPercent,
  }
}

export function getMaxCategoryCount(categories: CategoryStat[]) {
  return Math.max(1, ...categories.map((entry) => entry.count))
}

export function getMaxMonthlyCount(trends: MonthlyTrendStat[]) {
  return Math.max(1, ...trends.map((entry) => entry.count))
}

export function getTotalStatusCount(statuses: StatusStat[]) {
  return statuses.reduce((sum, entry) => sum + entry.count, 0)
}
