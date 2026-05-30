import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { AlertCircle, MapPin } from 'lucide-react'

import { Alert } from '../../components/common/Alert'

import { Button } from '../../components/common/Button'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/Card'

import { EmptyState } from '../../components/common/EmptyState'

import { PageContainer } from '../../components/common/PageContainer'

import { SectionHeader } from '../../components/common/SectionHeader'

import { ComplaintRoutingInfo } from '../../components/complaints/ComplaintRoutingInfo'

import { ComplaintSummaryCard } from '../../components/complaints/ComplaintSummaryCard'

import {

  resolveComplaintById,

  resolvedDetailToMapMarker,

} from '../../lib/complaints/resolveComplaint'

import { fetchComplaintById } from '../../lib/api/complaints'

import { routes } from '../../lib/routes'

import { useComplaintStore } from '../../stores/complaintStore'

import { useMapStore } from '../../stores/mapStore'

import { USER_LOCATION_ZOOM } from '../../lib/map/constants'



export default function ComplaintDetailPage() {

  const { complaintId } = useParams()

  const navigate = useNavigate()

  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)

  const addSubmittedComplaint = useComplaintStore((state) => state.addSubmittedComplaint)

  const setSelection = useMapStore((state) => state.setSelection)

  const setViewport = useMapStore((state) => state.setViewport)



  const [remoteLoaded, setRemoteLoaded] = useState(false)

  const complaint = useMemo(

    () =>

      complaintId

        ? resolveComplaintById(complaintId, submittedComplaints)

        : null,

    [complaintId, submittedComplaints],

  )

  useEffect(() => {
    if (!complaintId || complaint) {
      setRemoteLoaded(true)
      return
    }

    let cancelled = false
    const requestedComplaintId = complaintId

    async function loadComplaint() {
      try {
        const result = await fetchComplaintById(requestedComplaintId)
        if (cancelled) return
        if (result) {
          addSubmittedComplaint(result)
        }
      } finally {
        if (!cancelled) setRemoteLoaded(true)
      }
    }

    void loadComplaint()
    return () => {
      cancelled = true
    }
  }, [addSubmittedComplaint, complaint, complaintId])

  if (!complaint && !remoteLoaded) {

    return (

      <PageContainer>

        <EmptyState

          icon={AlertCircle}

          title="Loading complaint"

          description="Fetching the latest complaint record from the backend."

        />

      </PageContainer>

    )

  }



  if (!complaint) {

    return (

      <PageContainer>

        <EmptyState

          icon={AlertCircle}

          title="Complaint not found"

          description="This complaint record could not be loaded. Return to the dashboard or map and try another report."

        />

      </PageContainer>

    )

  }



  const handleShowOnMap = () => {

    const marker = resolvedDetailToMapMarker(complaint)

    setViewport({ lat: complaint.lat, lng: complaint.lng }, USER_LOCATION_ZOOM)

    setSelection({ kind: 'complaint', complaint: marker })

    navigate(routes.map)

  }



  const locationLine =

    complaint.locationLabel ??

    [complaint.city, complaint.state].filter(Boolean).join(', ')



  return (

    <PageContainer className="gap-8">

      <SectionHeader

        title="Complaint Details"

        description={`Viewing ${complaint.title}. Complaint ID: ${complaint.referenceId}.`}

      />



      <ComplaintSummaryCard

        title={complaint.title}

        referenceId={complaint.referenceId}

        roadName={complaint.roadName}

        status={complaint.status}

        severity={complaint.severity}

        reportedAt={complaint.reportedAt}

        updatedAt={complaint.updatedAt}

        resolutionStatus={complaint.resolutionStatus}

        citizenReports={complaint.citizenReports}

        maintenanceReports={complaint.maintenanceReports}

      />



      <ComplaintRoutingInfo

        complaintId={complaint.referenceId}

        roadType={complaint.roadType}

        issueType={complaint.issueType}

        assignedAuthority={complaint.assignedAuthority}

        assignedDepartment={complaint.assignedDepartment}

      />



      <Card>

        <CardHeader>

          <CardTitle className="text-base">Photo Evidence</CardTitle>

        </CardHeader>

        <CardContent>

          {complaint.photoDataUrl ? (

            <img

              src={complaint.photoDataUrl}

              alt="Complaint evidence"

              className="max-h-80 w-full rounded-lg border border-[var(--rw-border)] object-contain"

            />

          ) : (

            <p className="text-sm text-[var(--rw-text-secondary)]">No evidence photo uploaded</p>

          )}

        </CardContent>

      </Card>



      <Card>

        <CardHeader>

          <CardTitle className="text-base">Location</CardTitle>

          <CardDescription>{locationLine}</CardDescription>

        </CardHeader>

        <CardContent className="space-y-3 text-sm text-[var(--rw-text-secondary)]">

          <p>{complaint.description}</p>

          <p className="flex items-center gap-2 text-[var(--rw-text-primary)]">

            <MapPin className="size-4 shrink-0" aria-hidden="true" />

            <span>

              Coordinates: {complaint.lat.toFixed(3)}, {complaint.lng.toFixed(3)}

            </span>

          </p>

          <Alert variant="info" title="Show On Map">

            Open the map, center this complaint, and reveal the complaint popup.

          </Alert>

          <div className="flex flex-wrap gap-3">

            <Button type="button" onClick={handleShowOnMap}>

              Show On Map

            </Button>

            <Button

              type="button"

              variant="outline"

              onClick={() =>

                navigate(routes.assistant, {

                  state: {

                    contextType: 'complaint',

                    complaintId: complaint.id,

                    referenceId: complaint.referenceId,

                    issueType: complaint.issueType,

                    description: complaint.description,

                    latitude: complaint.lat,

                    longitude: complaint.lng,

                    location: locationLine,

                    authority: complaint.assignedAuthority,

                    assignedDepartment: complaint.assignedDepartment,

                    severity: complaint.severity,

                    status: complaint.status,

                    resolutionStatus: complaint.resolutionStatus,

                    roadId: complaint.roadId,

                    roadName: complaint.roadName,

                  },

                })

              }

            >

              Ask AI

            </Button>

          </div>

        </CardContent>

      </Card>

    </PageContainer>

  )

}


