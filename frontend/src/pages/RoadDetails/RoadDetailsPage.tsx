import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Alert } from '../../components/common/Alert'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ChartContainer } from '../../components/charts/ChartContainer'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { RoadSummaryCard } from '../../components/road/RoadSummaryCard'
import { complaintsByRoadId } from '../../data/complaints'
import { useRoad } from '../../hooks/useRoad'

export default function RoadDetailsPage() {
  const { roadId } = useParams()
  const { data: road, isPending, isError } = useRoad(roadId)

  if (isPending) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading road details" className="py-16" />
      </PageContainer>
    )
  }

  if (isError || !road) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertCircle}
          title="Road not found"
          description="This road record could not be loaded. Return home and select another corridor."
        />
      </PageContainer>
    )
  }

  const roadComplaints = complaintsByRoadId[road.id] ?? []

  const {
    id: _roadId,
    roadName,
    roadType,
    score,
    scoreTier,
    status,
    riskLevel,
    contractor,
    authority,
    lastRepairDate,
  } = road

  return (
    <PageContainer className="gap-8">
      <SectionHeader
        title="Road Details"
        description={`Viewing ${roadName}${roadType ? ` — ${roadType}` : ''}. Record ID: ${roadId ?? road.id}.`}
      />

      <RoadSummaryCard
        roadName={roadName}
        roadType={roadType}
        score={score}
        scoreTier={scoreTier}
        status={status}
        riskLevel={riskLevel}
        contractor={contractor}
        authority={authority}
        lastRepairDate={lastRepairDate}
      />

      <Alert variant="info" title="Data source">
        Records sourced from {authority} open data (placeholder).
      </Alert>

      <DashboardSection
        title="Budget Transparency"
        description={`Sanctioned versus spent amounts for ${roadName}.`}
      >
        <ChartContainer
          title="Budget Overview"
          description={`Budget visualization placeholder for ${roadName}.`}
        />
      </DashboardSection>

      <ComplaintListSection
        title="Complaint History"
        description={`Issues reported on ${roadName}.`}
        items={roadComplaints}
        emptyTitle="No complaints for this road"
        emptyDescription="No citizen reports have been filed for this corridor yet."
      />
    </PageContainer>
  )
}
