import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import {
  getComplaintDashboardMetrics,
  getComplaintMetricRecords,
  type ComplaintDisplayStatus,
} from '../analytics/complaintMetrics'
import { matchesStatusFilter } from './complaintStatus'
import { mergeComplaintsWithCatalog } from './unifiedComplaints'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'

export function ensureComplaintCatalog(
  submittedComplaints: StoredSubmittedComplaint[],
  setSubmittedComplaints: (complaints: StoredSubmittedComplaint[]) => void,
) {
  const merged = mergeComplaintsWithCatalog(submittedComplaints)
  if (merged.length !== submittedComplaints.length) {
    setSubmittedComplaints(merged)
  }
}

export function selectUnifiedComplaints(submittedComplaints: StoredSubmittedComplaint[]) {
  return mergeComplaintsWithCatalog(submittedComplaints)
}

export function selectComplaintMetrics(submittedComplaints: StoredSubmittedComplaint[]) {
  return getComplaintDashboardMetrics(mergeComplaintsWithCatalog(submittedComplaints))
}

export function selectRecentIntelligenceItems(
  submittedComplaints: StoredSubmittedComplaint[],
  limit = 3,
): ComplaintListItem[] {
  return mergeComplaintsWithCatalog(submittedComplaints)
    .map((entry) => entry.intelligenceItem)
    .slice(0, limit)
}

export type ComplaintHistoryFilters = {
  status: string
  issueType: string
  severity: string
  search: string
  sort: 'newest' | 'oldest'
}

export function selectComplaintHistoryItems(
  submittedComplaints: StoredSubmittedComplaint[],
  filters: ComplaintHistoryFilters,
  options?: { alreadyMerged?: boolean },
): ComplaintListItem[] {
  const query = filters.search.trim().toLowerCase()
  const source = options?.alreadyMerged
    ? submittedComplaints
    : mergeComplaintsWithCatalog(submittedComplaints)
  return source
    .map((entry) => entry.intelligenceItem)
    .filter((item) => {
      const statusMatch = matchesStatusFilter(item.status ?? 'pending', filters.status)
      const issueMatch = filters.issueType === 'all' || item.issueType === filters.issueType
      const severityMatch = filters.severity === 'all' || item.severity === filters.severity
      const queryMatch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.referenceId?.toLowerCase().includes(query) ||
        item.roadName?.toLowerCase().includes(query)
      return statusMatch && issueMatch && severityMatch && queryMatch
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.reportedAt ?? '')
      const bTime = Date.parse(b.reportedAt ?? '')
      return filters.sort === 'oldest' ? aTime - bTime : bTime - aTime
    })
}

export function getDisplayStatusForComplaint(
  complaintId: string,
  submittedComplaints: StoredSubmittedComplaint[],
): ComplaintDisplayStatus | null {
  const record = getComplaintMetricRecords(mergeComplaintsWithCatalog(submittedComplaints)).find(
    (row) => row.id === complaintId,
  )
  return record?.displayStatus ?? null
}
