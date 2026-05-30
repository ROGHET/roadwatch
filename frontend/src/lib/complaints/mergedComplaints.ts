import { mockComplaintSummaries } from '../../data/complaints'
import { mapComplaintMarkers as mockMapComplaintMarkers } from '../../data/mapMarkers'
import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { MapComplaintMarker } from '../map/types'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'

export function getMergedComplaintMarkers(
  submitted: StoredSubmittedComplaint[],
): MapComplaintMarker[] {
  const submittedMarkers = submitted.map((entry) => entry.marker)
  const submittedIds = new Set(submittedMarkers.map((marker) => marker.id))

  return [
    ...submittedMarkers,
    ...mockMapComplaintMarkers.filter((marker) => !submittedIds.has(marker.id)),
  ]
}

export function getRecentIntelligenceItems(
  submitted: StoredSubmittedComplaint[],
  limit = 3,
): ComplaintListItem[] {
  const submittedItems = submitted.map((entry) => entry.intelligenceItem)
  const remaining = Math.max(0, limit - submittedItems.length)

  return [...submittedItems.slice(0, limit), ...mockComplaintSummaries.slice(0, remaining)]
}
