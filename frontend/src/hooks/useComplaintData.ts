import { useMemo } from 'react'
import { getComplaintDashboardMetrics } from '../lib/analytics/complaintMetrics'
import { selectComplaintMetrics } from '../lib/complaints/complaintSelectors'
import { mergeComplaintsWithCatalog } from '../lib/complaints/unifiedComplaints'
import { useComplaintStore } from '../stores/complaintStore'

/** Unified catalog + submissions; stable while `submittedComplaints` reference is unchanged. */
export function useUnifiedComplaints() {
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  return useMemo(
    () => mergeComplaintsWithCatalog(submittedComplaints),
    [submittedComplaints],
  )
}

/** Dashboard KPI metrics from unified complaints. */
export function useComplaintDashboardMetrics() {
  const unified = useUnifiedComplaints()
  return useMemo(() => getComplaintDashboardMetrics(unified), [unified])
}

/** @deprecated Prefer useComplaintDashboardMetrics — kept for drop-in selector shape. */
export function useComplaintMetrics() {
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  return useMemo(
    () => selectComplaintMetrics(submittedComplaints),
    [submittedComplaints],
  )
}
