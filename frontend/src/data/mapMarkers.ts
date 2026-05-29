import type { MapComplaintMarker } from '../lib/map/types'
import { mockComplaintSummaries } from './complaints'
import { mockRoads } from './roads'

const complaintCoordinates: Record<
  string,
  { lat: number; lng: number; roadId: string }
> = {
  'cmp-001': { lat: 12.9832, lng: 80.2498, roadId: 'chennai-omr-service-lane' },
  'cmp-002': { lat: 13.0312, lng: 80.1764, roadId: 'chennai-gst-road' },
  'cmp-003': { lat: 12.9798, lng: 80.2461, roadId: 'chennai-omr-service-lane' },
  'cmp-004': { lat: 12.9018, lng: 80.2482, roadId: 'chennai-ecr-highway' },
  'cmp-005': { lat: 13.0621, lng: 80.2662, roadId: 'chennai-anna-salai' },
  'cmp-006': { lat: 13.0089, lng: 80.2228, roadId: 'chennai-sardar-patel-road' },
  'cmp-007': { lat: 12.9124, lng: 77.6188, roadId: 'bengaluru-hosur-road' },
  'cmp-008': { lat: 19.1198, lng: 72.8584, roadId: 'mumbai-western-express' },
}

export const mapComplaintMarkers: MapComplaintMarker[] = mockComplaintSummaries
  .map((complaint) => {
    const coordinates = complaintCoordinates[complaint.id]
    if (!coordinates) return null

    return {
      ...complaint,
      ...coordinates,
    }
  })
  .filter((complaint): complaint is MapComplaintMarker => complaint !== null)

export const mapRoadMarkers = mockRoads
