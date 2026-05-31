export type RoadBudgetSummary = {
  sanctioned: string
  spent: string
}

export const roadBudgetById: Record<string, RoadBudgetSummary> = {}

export function getRoadBudget(roadId: string): RoadBudgetSummary {
  return (
    roadBudgetById[roadId] ?? {
      sanctioned: 'Data unavailable',
      spent: 'Data unavailable',
    }
  )
}
