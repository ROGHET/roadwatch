export type RoadBudgetSummary = {
  sanctioned?: string
  released?: string
  utilized?: string
  spent?: string
}

export const roadBudgetById: Record<string, RoadBudgetSummary> = {}

export function getRoadBudget(roadId: string, _stateHint?: string | null): RoadBudgetSummary {
  const direct = roadBudgetById[roadId]
  if (direct?.sanctioned || direct?.released || direct?.utilized || direct?.spent) {
    return direct
  }
  return {}
}

export function hasRoadSpecificBudget(roadId: string): boolean {
  const direct = roadBudgetById[roadId]
  return Boolean(direct?.sanctioned || direct?.released || direct?.utilized || direct?.spent)
}
