import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { MapComplaintMarker } from '../map/types'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'

export function getMergedComplaintMarkers(
  submitted: StoredSubmittedComplaint[],
): MapComplaintMarker[] {
  return submitted.map((entry) => entry.marker)
}

export function getRecentIntelligenceItems(
  submitted: StoredSubmittedComplaint[],
  limit = 3,
): ComplaintListItem[] {
  const submittedItems = submitted.map((entry) => entry.intelligenceItem)
  return submittedItems.slice(0, limit)
}
