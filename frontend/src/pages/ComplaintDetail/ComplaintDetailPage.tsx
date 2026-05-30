import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, MapPin } from 'lucide-react'
import { Alert } from '../../components/common/Alert'
import { Button } from '../../components/common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ComplaintSummaryCard } from '../../components/complaints/ComplaintSummaryCard'
import { mockComplaintRecords } from '../../data/complaints'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'
import { USER_LOCATION_ZOOM } from '../../lib/map/constants'

export default function ComplaintDetailPage() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const setSelection = useMapStore((state) => state.setSelection)
  const setViewport = useMapStore((state) => state.setViewport)

  const complaint = useMemo(
    () => mockComplaintRecords.find((record) => record.id === complaintId) ?? null,
    [complaintId],
  )

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
    setViewport({ lat: complaint.lat, lng: complaint.lng }, USER_LOCATION_ZOOM)
    setSelection({ kind: 'complaint', complaint })
    navigate(routes.map)
  }

  return (
    <PageContainer className="gap-8">
      <SectionHeader
        title="Complaint Details"
        description={`Viewing ${complaint.title}. Complaint ID: ${complaint.id}.`}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
          <CardDescription>
            {complaint.city}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--rw-text-secondary)]">
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
            <Button type="button" variant="outline" onClick={() => navigate(routes.assistant, { state: { contextType: 'complaint', complaintId: complaint.id, roadId: complaint.roadId, roadName: complaint.roadName, latitude: complaint.lat, longitude: complaint.lng } })}>
              Ask AI
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
