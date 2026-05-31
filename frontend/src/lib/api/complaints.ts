import { mockComplaintRecords } from '../../data/complaints'
import {
  COMPLAINT_ISSUE_TYPE_OPTIONS,
  type RoadType,
} from '../complaintRouting'
import { apiClient, useMockData } from './client'
import { normalizeApiError } from './errors'

export type ComplaintLookupResult = {
  complaintId: string
  status: string
  authority: string
  department: string
  lastUpdated: string
}

function formatDisplayDate(isoOrDate?: string | Date): string {
  const date = isoOrDate ? new Date(isoOrDate) : new Date()
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function mapRecordToLookup(record: (typeof mockComplaintRecords)[number]): ComplaintLookupResult {
  return {
    complaintId: record.referenceId,
    status: formatStatusLabel(record.status),
    authority: record.assignedAuthority,
    department: record.assignedDepartment,
    lastUpdated: record.updatedAt ?? record.reportedAt ?? formatDisplayDate(),
  }
}

export type SubmitComplaintInput = {
  roadType: RoadType
  issueType: string
  severity: string
  description: string
  lat: number
  lng: number
  locationLabel?: string
  city?: string
  state?: string
  photoUrl?: string
  userId?: string
}

export type ComplaintRoutingResult = {
  id: string
  complaintId: string
  roadType: RoadType
  issueType: string
  assignedAuthority: string
  assignedDepartment: string
  severity: string
  description: string
  status: string
  latitude: number
  longitude: number
  locationLabel?: string
  city?: string
  state?: string
  roadId?: string
  roadName?: string
  photoUrl?: string
  createdAt?: string
  updatedAt?: string
}

export async function submitComplaint(
  input: SubmitComplaintInput,
): Promise<ComplaintRoutingResult> {
  if (useMockData) {
    throw new Error('Data unavailable')
  }

  try {
    const { data } = await apiClient.post<ComplaintRoutingResult>('/api/complaints', {
      roadType: input.roadType,
      issueType: input.issueType,
      severity: input.severity,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      locationLabel: input.locationLabel,
      city: input.city,
      state: input.state,
      photoUrl: input.photoUrl,
      userId: input.userId,
    })

    return mapApiComplaintToRoutingResult(data, input)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

type ApiComplaintRecord = {
  id?: string
  complaintId?: string | null
  roadType?: string | null
  issueType?: string
  severity?: string
  description?: string
  status?: string
  latitude?: number
  longitude?: number
  locationLabel?: string | null
  city?: string | null
  state?: string | null
  assignedAuthority?: string | null
  assignedDepartment?: string | null
  roadId?: string | null
  road?: { id?: string; name?: string; type?: string } | null
  photoUrl?: string | null
  updatedAt?: string
  createdAt?: string
}

function mapApiComplaintToRoutingResult(
  record: ApiComplaintRecord,
  fallback?: Partial<SubmitComplaintInput>,
): ComplaintRoutingResult {
  return {
    id: record.id ?? record.complaintId ?? '',
    complaintId: record.complaintId ?? record.id ?? '',
    roadType: (record.roadType ?? fallback?.roadType ?? 'NH') as RoadType,
    issueType: record.issueType ?? fallback?.issueType ?? 'Other',
    assignedAuthority: record.assignedAuthority ?? '',
    assignedDepartment: record.assignedDepartment ?? '',
    severity: record.severity ?? fallback?.severity ?? 'medium',
    description: record.description ?? fallback?.description ?? '',
    status: record.status ?? 'PENDING',
    latitude: record.latitude ?? fallback?.lat ?? 0,
    longitude: record.longitude ?? fallback?.lng ?? 0,
    locationLabel: record.locationLabel ?? fallback?.locationLabel,
    city: record.city ?? fallback?.city,
    state: record.state ?? fallback?.state,
    roadId: record.roadId ?? record.road?.id,
    roadName: record.road?.name ?? record.locationLabel ?? undefined,
    photoUrl: record.photoUrl ?? fallback?.photoUrl,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapApiComplaintToLookup(record: ApiComplaintRecord): ComplaintLookupResult | null {
  if (!record.complaintId) return null

  return {
    complaintId: record.complaintId,
    status: formatStatusLabel(record.status ?? 'PENDING'),
    authority: record.assignedAuthority ?? '—',
    department: record.assignedDepartment ?? '—',
    lastUpdated: formatDisplayDate(record.updatedAt ?? record.createdAt),
  }
}

export async function lookupComplaint(
  complaintId: string,
): Promise<ComplaintLookupResult | null> {
  const trimmed = complaintId.trim()

  if (useMockData) {
    const match = mockComplaintRecords.find(
      (record) => record.referenceId.toUpperCase() === trimmed.toUpperCase(),
    )
    return match ? mapRecordToLookup(match) : null
  }

  try {
    const { data } = await apiClient.get<ApiComplaintRecord>(
      `/api/complaints/${encodeURIComponent(trimmed)}`,
    )
    return mapApiComplaintToLookup(data)
  } catch (error) {
    if (normalizeApiError(error).status === 404) {
      return null
    }
    throw normalizeApiError(error)
  }
}

export async function fetchComplaints(): Promise<ComplaintRoutingResult[]> {
  if (useMockData) {
    return []
  }

  try {
    const { data } = await apiClient.get<ApiComplaintRecord[]>('/api/complaints')
    return data.map((record) => mapApiComplaintToRoutingResult(record))
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function fetchComplaintById(
  complaintId: string,
): Promise<ComplaintRoutingResult | null> {
  if (useMockData) {
    const record = mockComplaintRecords.find(
      (complaint) =>
        complaint.id.toUpperCase() === complaintId.toUpperCase() ||
        complaint.referenceId.toUpperCase() === complaintId.toUpperCase(),
    )
    return record
      ? {
          id: record.id,
          complaintId: record.referenceId,
          roadType: (record.roadType ?? 'NH') as RoadType,
          issueType: record.issueType ?? 'Other',
          assignedAuthority: record.assignedAuthority,
          assignedDepartment: record.assignedDepartment,
          severity: record.severity ?? 'medium',
          description: record.description ?? '',
          status: record.status,
          latitude: record.lat,
          longitude: record.lng,
          city: record.city,
          state: 'Tamil Nadu',
          roadId: record.roadId,
          roadName: record.roadName,
          createdAt: record.reportedAt,
          updatedAt: record.updatedAt,
        }
      : null
  }

  try {
    const { data } = await apiClient.get<ApiComplaintRecord>(
      `/api/complaints/${encodeURIComponent(complaintId)}`,
    )
    return mapApiComplaintToRoutingResult(data)
  } catch (error) {
    if (normalizeApiError(error).status === 404) return null
    throw normalizeApiError(error)
  }
}

export function normalizeIssueTypeForForm(issueType?: string): string | undefined {
  if (!issueType) return undefined

  const exact = COMPLAINT_ISSUE_TYPE_OPTIONS.find(
    (option) => option.value.toLowerCase() === issueType.toLowerCase(),
  )
  if (exact) return exact.value

  const normalized = issueType.toLowerCase()
  if (normalized.includes('pothole')) return 'Pothole'
  if (normalized.includes('crack')) return 'Road Crack'
  if (normalized.includes('waterlog') || normalized.includes('flood')) return 'Waterlogging'
  if (normalized.includes('sign')) return 'Missing Signage'
  if (normalized.includes('light')) return 'Streetlight Failure'
  if (normalized.includes('accident')) return 'Accident Hazard'

  return 'Other'
}
