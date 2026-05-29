import { mockRoads, type MockRoad } from '../../data/roads'
import { apiClient, useMockData } from './client'
import { normalizeApiError } from './errors'

const mockDelayMs = 120

function mockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), mockDelayMs)
  })
}

export async function fetchRoads(): Promise<MockRoad[]> {
  if (useMockData) {
    return mockDelay([...mockRoads])
  }

  try {
    const { data } = await apiClient.get<MockRoad[]>('/roads')
    return data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function fetchRoadById(roadId: string): Promise<MockRoad | undefined> {
  if (useMockData) {
    const road = mockRoads.find((record) => record.id === roadId)
    return mockDelay(road)
  }

  try {
    const { data } = await apiClient.get<MockRoad>(`/roads/${roadId}`)
    return data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
