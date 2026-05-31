import type { RoadSummaryCardProps } from '../components/road/RoadSummaryCard'

export type MockRoad = {
  id: string
  city: string
  state?: string
  lat: number
  lng: number
} & Omit<RoadSummaryCardProps, 'footer' | 'className'>

export type RoadSelectOption = {
  value: string
  label: string
}

export const DATA_UNAVAILABLE = 'Data unavailable'

export let mockRoads: MockRoad[] = []

export let roadSelectOptions: RoadSelectOption[] = []

export function setRoadCatalog(roads: MockRoad[]) {
  mockRoads = roads
  roadSelectOptions = roads.map((road) => ({
    value: road.id,
    label: `${road.roadName} (${road.roadType ?? 'Road'})`,
  }))
}
