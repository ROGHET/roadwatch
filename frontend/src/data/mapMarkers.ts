import type { MapComplaintMarker } from '../lib/map/types'
import { mockComplaintRecords } from './complaints'
import { mockRoads } from './roads'

export const mapComplaintMarkers: MapComplaintMarker[] = mockComplaintRecords.map((complaint) => ({
  ...complaint,
  roadId: complaint.roadId,
  lat: complaint.lat,
  lng: complaint.lng,
}))

export const mapRoadMarkers = mockRoads
