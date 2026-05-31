import type { MapComplaintMarker } from '../map/types'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'
import {
  selectRecentIntelligenceItems,
  type ComplaintHistoryFilters,
  selectComplaintHistoryItems,
} from './complaintSelectors'

export function getMergedComplaintMarkers(
  submitted: StoredSubmittedComplaint[],
): MapComplaintMarker[] {
  return submitted.map((entry) => entry.marker)
}

export { selectRecentIntelligenceItems as getRecentIntelligenceItems }
export { selectComplaintHistoryItems, type ComplaintHistoryFilters }
