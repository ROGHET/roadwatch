import { mockComplaintRecords } from '../../data/complaints'
import {
  buildMockComplaintId,
  COMPLAINT_ISSUE_TYPE_OPTIONS,
  resolveAuthorityRouting,
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
  updatedAt?: string
}

const mockDelayMs = 150
let mockSequence = 1043

function mockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), mockDelayMs)
  })
}

export async function submitComplaint(
  input: SubmitComplaintInput,
): Promise<ComplaintRoutingResult> {
  if (useMockData) {
    const routing = resolveAuthorityRouting(input.roadType)
    mockSequence += 1

    return mockDelay({
      id: `mock-${mockSequence}`,
      complaintId: buildMockComplaintId(mockSequence),
      roadType: input.roadType,
      issueType: input.issueType,
      assignedAuthority: routing.assignedAuthority,
      assignedDepartment: routing.assignedDepartment,
      severity: input.severity,
      description: input.description,
      status: 'ROUTED',
      latitude: input.lat,
      longitude: input.lng,
      updatedAt: new Date().toISOString(),
    })
  }

  try {
    const { data } = await apiClient.post<ComplaintRoutingResult>('/api/complaints', {
      roadType: input.roadType,
      issueType: input.issueType,
      severity: input.severity,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      photoUrl: input.photoUrl,
      userId: input.userId,
    })

    return {
      id: data.id,
      complaintId: data.complaintId ?? '',
      roadType: (data.roadType ?? input.roadType) as RoadType,
      issueType: data.issueType,
      assignedAuthority: data.assignedAuthority ?? '',
      assignedDepartment: data.assignedDepartment ?? '',
      severity: data.severity,
      description: data.description,
      status: data.status,
      latitude: data.latitude,
      longitude: data.longitude,
      updatedAt: data.updatedAt,
    }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

type ApiComplaintRecord = {
  complaintId?: string | null
  status?: string
  assignedAuthority?: string | null
  assignedDepartment?: string | null
  updatedAt?: string
  createdAt?: string
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
