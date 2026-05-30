import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComplaintListItem } from '../components/complaints/ComplaintListSection'
import type { ComplaintStatus } from '../components/complaints/ComplaintStatusBadge'
import type { ComplaintSeverity } from '../components/complaints/ComplaintCard'
import type { ComplaintRoutingResult } from '../lib/api/complaints'
import type { RoadType } from '../lib/complaintRouting'
import type { MapComplaintMarker } from '../lib/map/types'

export type ComplaintDraft = {
  roadType: RoadType
  issueType: string
  severity: string
  description: string
  latitude: string
  longitude: string
  locationLabel?: string
  city?: string
  state?: string
  roadId?: string
  roadName?: string
  photoDataUrl?: string
  savedAt: string
}

export type ComplaintLookupRecord = {
  complaintId: string
  status: string
  authority: string
  department: string
  lastUpdated: string
}

export type StoredSubmittedComplaint = {
  submittedAt: string
  marker: MapComplaintMarker
  intelligenceItem: ComplaintListItem
  lookup: ComplaintLookupRecord
  description: string
  city: string
  state: string
  locationLabel?: string
  photoDataUrl?: string
}

type PickedMapLocation = {
  lat: number
  lng: number
  label?: string
  city?: string
  state?: string
}

type LocationDraftPatch = {
  latitude: string
  longitude: string
  locationLabel?: string
  city?: string
  state?: string
}

type ComplaintStoreState = {
  draft: ComplaintDraft | null
  submittedComplaints: StoredSubmittedComplaint[]
  complaintPickMode: boolean
  locationPickPending: boolean
  pickedLocation: PickedMapLocation | null
  saveDraft: (draft: Omit<ComplaintDraft, 'savedAt'>) => void
  updateDraftLocation: (patch: LocationDraftPatch) => void
  clearDraft: () => void
  resetComplaintForm: () => void
  addSubmittedComplaint: (
    result: ComplaintRoutingResult,
    context?: {
      roadName?: string
      locationLabel?: string
      roadId?: string
      city?: string
      state?: string
      photoDataUrl?: string
    },
  ) => void
  findSubmittedByComplaintId: (complaintId: string) => ComplaintLookupRecord | null
  requestComplaintLocationPick: () => void
  completeLocationPick: (
    lat: number,
    lng: number,
    label?: string,
    city?: string,
    state?: string,
  ) => void
  clearPickedLocation: () => void
  cancelLocationPick: () => void
}

function mapSeverity(severity: string): ComplaintSeverity {
  const normalized = severity.toLowerCase()
  if (normalized === 'critical') return 'critical'
  if (normalized === 'high') return 'high'
  if (normalized === 'low') return 'low'
  return 'medium'
}

function mapStatus(status: string): ComplaintStatus {
  const normalized = status.toLowerCase()
  if (normalized === 'routed') return 'routed'
  if (normalized === 'in_progress' || normalized === 'in progress') return 'in_review'
  if (normalized === 'resolved') return 'resolved'
  if (normalized === 'rejected') return 'rejected'
  return 'pending'
}

function formatDisplayDate(isoOrDate?: string): string {
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

export function buildStoredSubmittedComplaint(
  result: ComplaintRoutingResult,
  context?: {
    roadName?: string
    locationLabel?: string
    roadId?: string
    city?: string
    state?: string
    photoDataUrl?: string
  },
): StoredSubmittedComplaint {
  const submittedAt = new Date().toISOString()
  const reportedAt = formatDisplayDate(submittedAt)
  const updatedAt = formatDisplayDate(result.updatedAt ?? submittedAt)
  const locationLabel = context?.locationLabel
  const city = context?.city ?? 'Unknown City'
  const state = context?.state ?? 'Unknown State'
  const roadName = context?.roadName ?? locationLabel
  const title = roadName
    ? `${result.issueType} — ${roadName}`
    : `${result.issueType} report`

  const marker: MapComplaintMarker = {
    id: result.id,
    roadId: context?.roadId ?? `submitted-${result.id}`,
    lat: result.latitude,
    lng: result.longitude,
    title,
    referenceId: result.complaintId,
    roadName,
    roadType: result.roadType,
    issueType: result.issueType,
    assignedAuthority: result.assignedAuthority,
    assignedDepartment: result.assignedDepartment,
    status: mapStatus(result.status),
    severity: mapSeverity(result.severity),
    reportedAt,
    updatedAt,
    resolutionStatus: formatStatusLabel(result.status),
  }

  const intelligenceItem: ComplaintListItem = {
    id: marker.id,
    title: marker.title,
    referenceId: marker.referenceId,
    roadName: marker.roadName,
    roadType: marker.roadType,
    issueType: marker.issueType,
    assignedAuthority: marker.assignedAuthority,
    assignedDepartment: marker.assignedDepartment,
    status: marker.status,
    severity: marker.severity,
    reportedAt: marker.reportedAt,
    updatedAt: marker.updatedAt,
    resolutionStatus: marker.resolutionStatus,
  }

  const lookup: ComplaintLookupRecord = {
    complaintId: result.complaintId,
    status: formatStatusLabel(result.status),
    authority: result.assignedAuthority,
    department: result.assignedDepartment,
    lastUpdated: updatedAt,
  }

  return {
    submittedAt,
    marker,
    intelligenceItem,
    lookup,
    description: result.description,
    city,
    state,
    locationLabel,
    photoDataUrl: context?.photoDataUrl,
  }
}

export const useComplaintStore = create<ComplaintStoreState>()(
  persist(
    (set, get) => ({
      draft: null,
      submittedComplaints: [],
      complaintPickMode: false,
      locationPickPending: false,
      pickedLocation: null,

      saveDraft: (draft) =>
        set({
          draft: {
            ...draft,
            savedAt: new Date().toISOString(),
          },
        }),

      updateDraftLocation: (patch) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                latitude: patch.latitude,
                longitude: patch.longitude,
                locationLabel: patch.locationLabel ?? state.draft.locationLabel,
                city: patch.city ?? state.draft.city,
                state: patch.state ?? state.draft.state,
                savedAt: new Date().toISOString(),
              }
            : {
                roadType: 'NH',
                issueType: 'Pothole',
                severity: 'medium',
                description: '',
                latitude: patch.latitude,
                longitude: patch.longitude,
                locationLabel: patch.locationLabel,
                city: patch.city,
                state: patch.state,
                savedAt: new Date().toISOString(),
              },
        })),

      clearDraft: () => set({ draft: null }),

      resetComplaintForm: () =>
        set({
          draft: null,
          pickedLocation: null,
          complaintPickMode: false,
          locationPickPending: false,
        }),

      addSubmittedComplaint: (result, context) =>
        set((state) => ({
          submittedComplaints: [
            buildStoredSubmittedComplaint(result, context),
            ...state.submittedComplaints.filter(
              (entry) => entry.lookup.complaintId !== result.complaintId,
            ),
          ],
        })),

      findSubmittedByComplaintId: (complaintId) => {
        const normalized = complaintId.trim().toUpperCase()
        const match = get().submittedComplaints.find(
          (entry) => entry.lookup.complaintId.toUpperCase() === normalized,
        )
        return match?.lookup ?? null
      },

      requestComplaintLocationPick: () =>
        set({ complaintPickMode: true, locationPickPending: true }),

      completeLocationPick: (lat, lng, label, city, state) =>
        set({
          complaintPickMode: false,
          locationPickPending: false,
          pickedLocation: { lat, lng, label, city, state },
        }),

      clearPickedLocation: () => set({ pickedLocation: null }),

      cancelLocationPick: () =>
        set({ complaintPickMode: false, locationPickPending: false }),
    }),
    {
      name: 'rw-complaint-workflow',
      partialize: (state) => ({
        draft: state.draft,
        submittedComplaints: state.submittedComplaints,
      }),
    },
  ),
)
