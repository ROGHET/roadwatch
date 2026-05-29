export type RoadBudgetSummary = {
  sanctioned: string
  spent: string
}

export const roadBudgetById: Record<string, RoadBudgetSummary> = {
  'chennai-sardar-patel-road': { sanctioned: '12.4 Cr', spent: '9.8 Cr' },
  'chennai-gst-road': { sanctioned: '48.2 Cr', spent: '41.6 Cr' },
  'chennai-omr-service-lane': { sanctioned: '8.6 Cr', spent: '6.1 Cr' },
  'chennai-ecr-highway': { sanctioned: '22.0 Cr', spent: '19.4 Cr' },
  'chennai-anna-salai': { sanctioned: '15.3 Cr', spent: '11.2 Cr' },
  'mumbai-western-express': { sanctioned: '62.5 Cr', spent: '58.0 Cr' },
  'delhi-ring-road': { sanctioned: '35.8 Cr', spent: '34.9 Cr' },
  'bengaluru-hosur-road': { sanctioned: '28.4 Cr', spent: '21.7 Cr' },
}

export function getRoadBudget(roadId: string): RoadBudgetSummary {
  return (
    roadBudgetById[roadId] ?? {
      sanctioned: 'Not published',
      spent: 'Not published',
    }
  )
}
