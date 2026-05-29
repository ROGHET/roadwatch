import { useQuery } from '@tanstack/react-query'
import { fetchRoads } from '../lib/api/roads'

export function useRoads() {
  return useQuery({
    queryKey: ['roads'],
    queryFn: fetchRoads,
  })
}
