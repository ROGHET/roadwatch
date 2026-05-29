import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
} from 'lucide-react'
import { ChartContainer } from '../../components/charts/ChartContainer'
import { MetricCard } from '../../components/charts/MetricCard'
import { StatGrid } from '../../components/charts/StatGrid'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { DashboardSection } from '../../components/dashboard/DashboardSection'

const mockComplaints = [
  {
    id: 'cmp-001',
    referenceId: 'RW-2026-001',
    title: 'Potholes near main junction',
    roadName: 'Sardar Patel Road',
    status: 'pending' as const,
    severity: 'high' as const,
    reportedAt: '28 May 2026',
  },
  {
    id: 'cmp-002',
    referenceId: 'RW-2026-002',
    title: 'Waterlogging after rainfall',
    roadName: 'GST Road',
    status: 'routed' as const,
    severity: 'medium' as const,
    reportedAt: '27 May 2026',
  },
  {
    id: 'cmp-003',
    referenceId: 'RW-2026-003',
    title: 'Missing street lighting',
    roadName: 'OMR Service Lane',
    status: 'in_review' as const,
    severity: 'low' as const,
    reportedAt: '26 May 2026',
  },
  {
    id: 'cmp-004',
    referenceId: 'RW-2026-004',
    title: 'Damaged median barrier',
    roadName: 'ECR Highway',
    status: 'resolved' as const,
    severity: 'critical' as const,
    reportedAt: '24 May 2026',
  },
]

export default function DashboardPage() {
  return (
    <PageContainer className="gap-8">
      <SectionHeader
        title="Authority Dashboard"
        description="Monitor pending complaints, resolution progress, and severity distribution."
      />

      <DashboardSection
        title="Overview"
        description="Snapshot of complaint volume and status."
      >
        <StatGrid columns={4}>
          <MetricCard
            label="Total Complaints"
            value={128}
            icon={ClipboardList}
            hint="All time"
          />
          <MetricCard
            label="Pending"
            value={34}
            icon={Clock}
            hint="Awaiting action"
          />
          <MetricCard
            label="Resolved"
            value={72}
            icon={CheckCircle2}
            hint="Closed this month"
          />
          <MetricCard
            label="Critical Open"
            value={6}
            icon={AlertTriangle}
            hint="Requires immediate attention"
          />
        </StatGrid>
      </DashboardSection>

      <DashboardSection
        title="Severity Breakdown"
        description="Distribution of open complaints by severity level."
      >
        <ChartContainer
          title="Complaints by Severity"
          description="Visualization placeholder for pending, high, medium, and low counts."
        />
      </DashboardSection>

      <ComplaintListSection
        title="Recent Complaints"
        description="Latest submissions routed to your authority."
        items={mockComplaints}
      />
    </PageContainer>
  )
}
