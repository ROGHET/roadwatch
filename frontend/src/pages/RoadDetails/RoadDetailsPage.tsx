import { useParams } from 'react-router-dom'
import { Alert } from '../../components/common/Alert'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ChartContainer } from '../../components/charts/ChartContainer'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { RoadSummaryCard } from '../../components/road/RoadSummaryCard'
import { complaintsByRoadId } from '../../data/complaints'
import { mockRoads } from '../../data/roads'

export default function RoadDetailsPage() {
  const { roadId } = useParams()
  const road = mockRoads.find((record) => record.id === roadId) ?? mockRoads[0]
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
