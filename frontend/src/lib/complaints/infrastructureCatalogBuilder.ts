import { infrastructureReports } from '../../data/infrastructureReports'
import {
  buildStoredSubmittedComplaint,
  type StoredSubmittedComplaint,
} from '../../stores/complaintStore'
import type { ComplaintRoutingResult } from '../api/complaints'
import { getComplaintMetricRecords } from '../analytics/complaintMetrics'

function buildCatalogEntryFromReport(
  record: (typeof infrastructureReports)[number],
): StoredSubmittedComplaint {
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
    createdAt: record.reportedAt,
  }
  return buildStoredSubmittedComplaint(result, {
    roadName: record.roadName,
    roadId: record.roadId,
    city: record.city,
    state: record.city,
  })
}

/** Builds catalog from CSV-backed reports — isolated chunk, not in main bundle. */
export function buildInfrastructureCatalog(): StoredSubmittedComplaint[] {
  const draft = infrastructureReports.map((record) => buildCatalogEntryFromReport(record))
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
