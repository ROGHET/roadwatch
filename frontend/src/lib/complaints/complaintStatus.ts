import type { ComplaintStatus } from '../../components/complaints/ComplaintStatusBadge'
import type { ComplaintDisplayStatus } from '../analytics/complaintMetrics'

/** Maps stored complaint status to dashboard / history display buckets. */
export function toDisplayStatus(status: ComplaintStatus): ComplaintDisplayStatus {
  if (status === 'resolved') return 'resolved'
  if (status === 'in_review' || status === 'routed') return 'in_review'
  return 'pending'
}

/** Whether a complaint matches a history/dashboard status filter. */
export function matchesStatusFilter(status: ComplaintStatus, filter: string): boolean {
  if (filter === 'all') return true
  if (filter === 'resolved') return status === 'resolved'
  if (filter === 'in_review') return status === 'in_review' || status === 'routed'
  if (filter === 'pending') return status === 'pending'
  if (filter === 'routed') return status === 'routed'
  if (filter === 'rejected') return status === 'rejected'
  return status === filter
}
