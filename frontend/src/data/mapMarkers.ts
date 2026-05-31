import type { MapComplaintMarker } from '../lib/map/types'
import { mockComplaintRecords } from './complaints'
import { mockRoads } from './roads'
import type { MockRoad } from './roads'

export let mapRoadMarkers: MockRoad[] = mockRoads

export function setMapRoadMarkers(roads: MockRoad[]) {
  mapRoadMarkers = roads
}

export let mapComplaintMarkers: MapComplaintMarker[] = mockComplaintRecords
  .filter((record) => record.lat !== 0 && record.lng !== 0)
  .map((complaint) => ({
    ...complaint,
    roadId: complaint.roadId,
    lat: complaint.lat,
    lng: complaint.lng,
  }))

export function setMapComplaintMarkers(markers: MapComplaintMarker[]) {
  mapComplaintMarkers = markers
}
