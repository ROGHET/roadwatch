import {
  bmcRoadBudgetRecords,
  crifBudgetRecords,
  gujaratRoadWorkRecords,
  roadWorkRecords,
} from './realDatasets'

export type RoadBudgetSummary = {
  sanctioned?: string
  released?: string
  utilized?: string
  spent?: string
}

export const roadBudgetById: Record<string, RoadBudgetSummary> = {}
export const budgetByRoadName = new Map<string, RoadBudgetSummary>()

function formatCrore(value: number | null | undefined): string | undefined {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) return undefined
  return `Rs ${value.toFixed(value >= 100 ? 0 : 1)} Cr`
}

function formatThousandAsCrore(value: number | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined
  return formatCrore(value / 10000)
}

function normalize(value?: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/\b(marg|road|rd|street|st|highway|corridor|nh|sh|mdr|odr)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function hasBudget(summary: RoadBudgetSummary | undefined): summary is RoadBudgetSummary {
  return Boolean(summary?.sanctioned || summary?.released || summary?.utilized || summary?.spent)
}

function setBudgetAlias(alias: string, summary: RoadBudgetSummary): void {
  const key = normalize(alias)
  if (key && hasBudget(summary) && !budgetByRoadName.has(key)) {
    budgetByRoadName.set(key, summary)
  }
}

function indexNameVariants(name: string, summary: RoadBudgetSummary): void {
  setBudgetAlias(name, summary)
  const bracketless = name.replace(/\([^)]*\)/g, ' ')
  setBudgetAlias(bracketless, summary)
  const slashParts = bracketless.split(/[\/,;]/)
  for (const part of slashParts) {
    setBudgetAlias(part, summary)
  }
}

const bmcRoadsBudget = (() => {
  const roads = bmcRoadBudgetRecords[0]
  const sanctioned = formatThousandAsCrore(roads?.sanctionedThousand)
  const released = formatThousandAsCrore(roads?.revenueEstimateThousand)
  const utilized = formatThousandAsCrore(86128)
  return {
    sanctioned,
    released,
    utilized,
  }
})()

const crifMadhyaPradeshBudget = (() => {
  const latest = crifBudgetRecords[crifBudgetRecords.length - 1]
  if (!latest) return {}
  const utilized = Math.max(0, latest.releasedCrore - latest.remainingCrore)
  return {
    sanctioned: formatCrore(latest.sanctionedCrore),
    released: formatCrore(latest.releasedCrore),
    utilized: formatCrore(utilized),
  }
})()

function buildBudgetIndex(): void {
  for (const row of roadWorkRecords) {
    const sanctioned = formatCrore(row.costCrore)
    indexNameVariants(row.name, { sanctioned })
  }

  for (const row of gujaratRoadWorkRecords) {
    const sanctioned = formatCrore(
      row.sanctionedLakh === null ? null : row.sanctionedLakh / 100,
    )
    indexNameVariants(row.name, { sanctioned })
  }

  const mumbaiBudgetAliases = [
    'mumbai',
    'maharashtra',
    'lal bahadur shastri',
    'lal bahadur shastri marg',
    'shastri',
    'shastri road',
    'dr shyamaprasad mukharji',
    'colaba',
    'cuffe parade',
    'ballard pier',
    'kala ghoda',
    'marine drive',
    'nariman point',
  ]
  for (const alias of mumbaiBudgetAliases) {
    setBudgetAlias(alias, bmcRoadsBudget)
  }

  setBudgetAlias('madhya pradesh', crifMadhyaPradeshBudget)
  setBudgetAlias('mp', crifMadhyaPradeshBudget)
}

buildBudgetIndex()

export function getRoadBudget(
  roadId: string,
  stateHint?: string | null,
  roadName?: string | null,
): RoadBudgetSummary {
  const direct = roadBudgetById[roadId]
  let budget: RoadBudgetSummary = {}

  if (hasBudget(direct)) {
    budget = direct
  } else {
    const roadKey = normalize(roadName)
    const stateKey = normalize(stateHint)
    budget =
      budgetByRoadName.get(roadKey) ??
      budgetByRoadName.get(stateKey) ??
      budgetByRoadName.get(normalize(`${roadName ?? ''} ${stateHint ?? ''}`)) ??
      {}
  }

  return budget
}

export function hasRoadSpecificBudget(
  roadId: string,
  stateHint?: string | null,
  roadName?: string | null,
): boolean {
  return hasBudget(getRoadBudget(roadId, stateHint, roadName))
}
