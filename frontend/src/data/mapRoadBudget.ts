import { crifBudgetRecords } from './realDatasets'

export type RoadBudgetSummary = {
  sanctioned?: string
  released?: string
  utilized?: string
  spent?: string
}

export const roadBudgetById: Record<string, RoadBudgetSummary> = {}

function formatCrore(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
}

export function getRoadBudget(roadId: string, _stateHint?: string | null): RoadBudgetSummary {
  const direct = roadBudgetById[roadId]
  if (direct?.sanctioned || direct?.released || direct?.utilized || direct?.spent) {
    return direct
  }

  const latest = crifBudgetRecords.at(-1)
  if (!latest) return {}

  const utilized =
    latest.spentCrore ?? Math.max(0, latest.releasedCrore - latest.remainingCrore)
  return {
    sanctioned: formatCrore(latest.sanctionedCrore),
    released: formatCrore(latest.releasedCrore),
    utilized: formatCrore(utilized),
    spent: formatCrore(utilized),
  }
}
