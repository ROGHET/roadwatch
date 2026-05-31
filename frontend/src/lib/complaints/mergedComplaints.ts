import type { MapComplaintMarker } from '../map/types'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'
import {
  selectRecentIntelligenceItems,
  type ComplaintHistoryFilters,
  selectComplaintHistoryItems,
} from './complaintSelectors'
import { mergeComplaintsWithCatalog } from './unifiedComplaints'

export function getMergedComplaintMarkers(
  submitted: StoredSubmittedComplaint[],
): MapComplaintMarker[] {
  return mergeComplaintsWithCatalog(submitted).map((entry) => entry.marker)
}

export { selectRecentIntelligenceItems as getRecentIntelligenceItems }
export { selectComplaintHistoryItems, type ComplaintHistoryFilters }
