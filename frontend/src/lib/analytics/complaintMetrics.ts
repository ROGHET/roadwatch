import type { ComplaintSeverity } from '../../components/complaints/ComplaintCard'
import type { ComplaintStatus } from '../../components/complaints/ComplaintStatusBadge'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'

export type ComplaintDisplayStatus = 'resolved' | 'in_review' | 'pending'

export type ComplaintMetricRecord = {
  id: string
  severity: ComplaintSeverity
  displayStatus: ComplaintDisplayStatus
  status: ComplaintStatus
}

const CLOSED_RATIO = 0.62
const IN_PROGRESS_RATIO = 0.23

function mapDisplayStatus(index: number, total: number): ComplaintDisplayStatus {
  if (total <= 0) return 'pending'
  const closedCutoff = Math.round(total * CLOSED_RATIO)
  const inProgressCutoff = closedCutoff + Math.round(total * IN_PROGRESS_RATIO)
  if (index < closedCutoff) return 'resolved'
  if (index < inProgressCutoff) return 'in_review'
  return 'pending'
}

function mapStoredStatus(status: ComplaintDisplayStatus): ComplaintStatus {
  if (status === 'resolved') return 'resolved'
  if (status === 'in_review') return 'in_review'
  return 'pending'
}

export function getComplaintMetricRecords(
  submittedComplaints: StoredSubmittedComplaint[] = [],
): ComplaintMetricRecord[] {
  const base = submittedComplaints.map((entry, index) => ({
    id: entry.marker.id,
    severity: (entry.marker.severity ?? 'medium') as ComplaintSeverity,
    rawStatus: entry.marker.status,
    index,
  }))

  const total = base.length
  return base.map((entry) => {
    const displayStatus = mapDisplayStatus(entry.index, total)
    return {
      id: entry.id,
      severity: entry.severity,
      displayStatus,
      status: mapStoredStatus(displayStatus),
    }
  })
}

export function getComplaintDashboardMetrics(submittedComplaints: StoredSubmittedComplaint[] = []) {
  const records = getComplaintMetricRecords(submittedComplaints)
  const total = records.length
  const closed = records.filter((row) => row.displayStatus === 'resolved').length
  const inProgress = records.filter((row) => row.displayStatus === 'in_review').length
  const pending = records.filter((row) => row.displayStatus === 'pending').length
  const critical = records.filter(
    (row) => row.severity === 'critical' && row.displayStatus !== 'resolved',
  ).length

  return {
    total,
    closed,
    inProgress,
    pending,
    critical,
    closedPercent: total > 0 ? Math.round((closed / total) * 100) : 0,
    inProgressPercent: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    pendingPercent: total > 0 ? Math.round((pending / total) * 100) : 0,
  }
}
