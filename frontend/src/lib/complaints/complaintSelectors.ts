import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { ComplaintStatus } from '../../components/complaints/ComplaintStatusBadge'
import { mockComplaintRecords } from '../../data/complaints'
import {
  getComplaintDashboardMetrics,
  getComplaintMetricRecords,
  type ComplaintDisplayStatus,
} from '../analytics/complaintMetrics'
import {
  buildStoredSubmittedComplaint,
  type StoredSubmittedComplaint,
} from '../../stores/complaintStore'
import type { ComplaintRoutingResult } from '../api/complaints'

function buildCatalogDraft(): StoredSubmittedComplaint[] {
  const draft = mockComplaintRecords.map((record) => {
    const result: ComplaintRoutingResult = {
      id: record.id,
      complaintId: record.referenceId,
      roadType: record.roadType,
      issueType: record.issueType,
      assignedAuthority: record.assignedAuthority,
      assignedDepartment: record.assignedDepartment,
      severity: record.severity ?? 'medium',
      description: record.description ?? '',
      status: record.status ?? 'pending',
      latitude: record.lat,
      longitude: record.lng,
      locationLabel: record.roadName,
      city: record.city,
      state: record.city,
      roadId: record.roadId,
      roadName: record.roadName,
      createdAt: (() => {
        if (!record.reportedAt) return undefined
        const parsed = new Date(record.reportedAt)
        if (Number.isNaN(parsed.getTime())) {
          if (import.meta.env.DEV) {
            console.warn(
              `[complaintSelectors] Invalid date value "${record.reportedAt}" on complaint id="${record.id}". Falling back to current date.`,
            )
          }
          return new Date().toISOString()
        }
        return parsed.toISOString()
      })(),
    }
    return buildStoredSubmittedComplaint(result, {
      roadName: record.roadName,
      roadId: record.roadId,
      city: record.city,
      state: record.city,
    })
  })

  const metrics = getComplaintMetricRecords(draft)
  const statusById = new Map(metrics.map((row) => [row.id, row.status]))

  return draft.map((entry) => {
    const status = statusById.get(entry.marker.id) ?? entry.marker.status
    const resolutionStatus = status.replace(/_/g, ' ')
    return {
      ...entry,
      marker: { ...entry.marker, status, resolutionStatus },
      intelligenceItem: { ...entry.intelligenceItem, status, resolutionStatus },
      lookup: { ...entry.lookup, status: resolutionStatus },
    }
  })
}

export function buildCatalogComplaints(): StoredSubmittedComplaint[] {
  return buildCatalogDraft()
}

export function ensureComplaintCatalog(
  submittedComplaints: StoredSubmittedComplaint[],
  setSubmittedComplaints: (complaints: StoredSubmittedComplaint[]) => void,
) {
  if (submittedComplaints.length > 0) return
  setSubmittedComplaints(buildCatalogComplaints())
}

export function selectComplaintMetrics(submittedComplaints: StoredSubmittedComplaint[]) {
  return getComplaintDashboardMetrics(submittedComplaints)
}

export function selectRecentIntelligenceItems(
  submittedComplaints: StoredSubmittedComplaint[],
  limit = 3,
): ComplaintListItem[] {
  return submittedComplaints.map((entry) => entry.intelligenceItem).slice(0, limit)
}

export type ComplaintHistoryFilters = {
  status: string
  issueType: string
  severity: string
  search: string
  sort: 'newest' | 'oldest'
}

function matchesDisplayStatus(itemStatus: ComplaintStatus, filter: string): boolean {
  if (filter === 'all') return true
  if (filter === 'resolved') return itemStatus === 'resolved'
  if (filter === 'in_review') return itemStatus === 'in_review'
  if (filter === 'pending') return itemStatus === 'pending'
  if (filter === 'routed') return itemStatus === 'routed'
  if (filter === 'rejected') return itemStatus === 'rejected'
  return itemStatus === filter
}

export function selectComplaintHistoryItems(
  submittedComplaints: StoredSubmittedComplaint[],
  filters: ComplaintHistoryFilters,
): ComplaintListItem[] {
  const query = filters.search.trim().toLowerCase()
  return submittedComplaints
    .map((entry) => entry.intelligenceItem)
    .filter((item) => {
      const statusMatch = matchesDisplayStatus(item.status ?? 'pending', filters.status)
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
  const record = getComplaintMetricRecords(submittedComplaints).find((row) => row.id === complaintId)
  return record?.displayStatus ?? null
}
