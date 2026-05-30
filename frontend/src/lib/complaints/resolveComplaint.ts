import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { ComplaintStatus } from '../../components/complaints/ComplaintStatusBadge'
import type { ComplaintSeverity } from '../../components/complaints/ComplaintCard'
import { mockComplaintRecords } from '../../data/complaints'
import type { StoredSubmittedComplaint } from '../../stores/complaintStore'
import type { MapComplaintMarker } from '../map/types'

export type ResolvedComplaintDetail = {
  id: string
  referenceId: string
  roadId: string
  title: string
  description: string
  roadName?: string
  city: string
  state: string
  lat: number
  lng: number
  roadType?: string
  issueType?: string
  assignedAuthority?: string
  assignedDepartment?: string
  status: ComplaintStatus
  severity?: ComplaintSeverity
  reportedAt?: string
  updatedAt?: string
  resolutionStatus?: string
  citizenReports?: number
  maintenanceReports?: number
  locationLabel?: string
  photoDataUrl?: string
}

function normalizeKey(value: string): string {
  return value.trim().toUpperCase()
}

export function submittedEntryToDetail(entry: StoredSubmittedComplaint): ResolvedComplaintDetail {
  const { marker } = entry
  return {
    id: marker.id,
    referenceId: marker.referenceId ?? marker.id,
    roadId: marker.roadId,
    title: marker.title,
    description: entry.description,
    roadName: marker.roadName,
    city: entry.city,
    state: entry.state,
    lat: marker.lat,
    lng: marker.lng,
    roadType: marker.roadType,
    issueType: marker.issueType,
    assignedAuthority: marker.assignedAuthority,
    assignedDepartment: marker.assignedDepartment,
    status: marker.status,
    severity: marker.severity,
    reportedAt: marker.reportedAt,
    updatedAt: marker.updatedAt,
    resolutionStatus: marker.resolutionStatus,
    citizenReports: marker.citizenReports,
    maintenanceReports: marker.maintenanceReports,
    locationLabel: entry.locationLabel,
    photoDataUrl: entry.photoDataUrl,
  }
}

export function mockRecordToDetail(
  record: (typeof mockComplaintRecords)[number],
): ResolvedComplaintDetail {
  return {
    id: record.id,
    referenceId: record.referenceId,
    roadId: record.roadId,
    title: record.title,
    description: record.description ?? '',
    roadName: record.roadName,
    city: record.city,
    state: 'Tamil Nadu',
    lat: record.lat,
    lng: record.lng,
    roadType: record.roadType,
    issueType: record.issueType,
    assignedAuthority: record.assignedAuthority,
    assignedDepartment: record.assignedDepartment,
    status: record.status,
    severity: record.severity,
    reportedAt: record.reportedAt,
    updatedAt: record.updatedAt,
    resolutionStatus: record.resolutionStatus,
    citizenReports: record.citizenReports,
    maintenanceReports: record.maintenanceReports,
  }
}

export function resolveComplaintById(
  complaintId: string,
  submittedComplaints: StoredSubmittedComplaint[],
): ResolvedComplaintDetail | null {
  const key = normalizeKey(complaintId)

  const submitted = submittedComplaints.find(
    (entry) =>
      normalizeKey(entry.marker.id) === key ||
      (entry.marker.referenceId && normalizeKey(entry.marker.referenceId) === key),
  )
  if (submitted) {
    return submittedEntryToDetail(submitted)
  }

  const mock = mockComplaintRecords.find(
    (record) =>
      normalizeKey(record.id) === key ||
      normalizeKey(record.referenceId) === key,
  )
  if (mock) {
    return mockRecordToDetail(mock)
  }

  return null
}

export function resolvedDetailToMapMarker(detail: ResolvedComplaintDetail): MapComplaintMarker {
  return {
    id: detail.id,
    roadId: detail.roadId,
    lat: detail.lat,
    lng: detail.lng,
    title: detail.title,
    referenceId: detail.referenceId,
    roadName: detail.roadName ?? detail.locationLabel,
    roadType: detail.roadType,
    issueType: detail.issueType,
    assignedAuthority: detail.assignedAuthority,
    assignedDepartment: detail.assignedDepartment,
    status: detail.status,
    severity: detail.severity,
    reportedAt: detail.reportedAt,
    updatedAt: detail.updatedAt,
    resolutionStatus: detail.resolutionStatus,
    citizenReports: detail.citizenReports,
    maintenanceReports: detail.maintenanceReports,
  }
}

export function resolvedDetailToListItem(detail: ResolvedComplaintDetail): ComplaintListItem {
  return {
    id: detail.id,
    title: detail.title,
    referenceId: detail.referenceId,
    roadName: detail.roadName ?? detail.locationLabel,
    roadType: detail.roadType,
    issueType: detail.issueType,
    assignedAuthority: detail.assignedAuthority,
    assignedDepartment: detail.assignedDepartment,
    status: detail.status,
    severity: detail.severity,
    reportedAt: detail.reportedAt,
    updatedAt: detail.updatedAt,
    resolutionStatus: detail.resolutionStatus,
    citizenReports: detail.citizenReports,
    maintenanceReports: detail.maintenanceReports,
  }
}
