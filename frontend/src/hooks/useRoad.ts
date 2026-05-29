import { useQuery } from '@tanstack/react-query'
import { fetchRoadById } from '../lib/api/roads'

export function useRoad(roadId: string | undefined) {
  return useQuery({
    queryKey: ['roads', roadId],
    queryFn: () => fetchRoadById(roadId ?? ''),
    enabled: Boolean(roadId),
  })
}
