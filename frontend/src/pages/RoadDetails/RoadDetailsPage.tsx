import { useParams } from 'react-router-dom'
import { Alert } from '../../components/common/Alert'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ChartContainer } from '../../components/charts/ChartContainer'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { RoadSummaryCard } from '../../components/road/RoadSummaryCard'

const mockRoadComplaints = [
  {
    id: 'road-cmp-1',
    referenceId: 'RW-2026-010',
    title: 'Surface cracks widening',
    roadName: 'Sardar Patel Road',
    status: 'pending' as const,
    severity: 'medium' as const,
    reportedAt: '25 May 2026',
  },
  {
    id: 'road-cmp-2',
    referenceId: 'RW-2026-011',
    title: 'Incomplete patch work',
    roadName: 'Sardar Patel Road',
    status: 'resolved' as const,
    severity: 'low' as const,
    reportedAt: '18 May 2026',
  },
]

export default function RoadDetailsPage() {
  const { roadId } = useParams()

  return (
    <PageContainer className="gap-8">
      <SectionHeader
        title="Road Details"
        description={`Viewing road record ${roadId ?? '—'} (placeholder data).`}
      />

      <RoadSummaryCard
        roadName="Sardar Patel Road"
        roadType="State Highway"
        score={78}
        scoreTier="good"
        status="open"
        riskLevel="medium"
        contractor="Chennai Infra Works Pvt. Ltd."
        authority="State Public Works Department"
        lastRepairDate="12 March 2026"
      />

      <Alert variant="info" title="Data source">
        Records sourced from public works department open data (placeholder).
      </Alert>

      <DashboardSection
        title="Budget Transparency"
        description="Sanctioned versus spent amounts for this road."
      >
        <ChartContainer
          title="Budget Overview"
          description="Sanctioned vs spent visualization placeholder."
        />
      </DashboardSection>

      <ComplaintListSection
        title="Complaint History"
        description="Recent issues reported on this road."
        items={mockRoadComplaints}
      />
    </PageContainer>
  )
}
