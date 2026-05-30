import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { ChartContainer } from '../../components/charts/ChartContainer'
import { MetricCard } from '../../components/charts/MetricCard'
import { StatGrid } from '../../components/charts/StatGrid'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import {
  dashboardPageCopy,
  dashboardSeverityChart,
} from '../../data/dashboard'
import { fetchComplaints } from '../../lib/api/complaints'
import { getRecentIntelligenceItems } from '../../lib/complaints/mergedComplaints'
import { routes } from '../../lib/routes'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../../stores/complaintStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)
  const recentComplaints = getRecentIntelligenceItems(submittedComplaints, 6)
  const dashboardMetrics = useMemo(
    () => [
      {
        id: 'total-complaints',
        label: 'Total Complaints',
        value: submittedComplaints.length,
        icon: ClipboardList,
        hint: 'Stored complaint records',
      },
      {
        id: 'pending-complaints',
        label: 'Pending',
        value: submittedComplaints.filter((entry) =>
          ['pending', 'routed', 'in_review'].includes(entry.marker.status),
        ).length,
        icon: Clock,
        hint: 'Awaiting authority action',
      },
      {
        id: 'resolved-complaints',
        label: 'Resolved',
        value: submittedComplaints.filter((entry) => entry.marker.status === 'resolved').length,
        icon: CheckCircle2,
        hint: 'Closed complaint records',
      },
      {
        id: 'critical-open',
        label: 'Critical Open',
        value: submittedComplaints.filter(
          (entry) => entry.marker.severity === 'critical' && entry.marker.status !== 'resolved',
        ).length,
        icon: AlertTriangle,
        hint: 'Immediate safety risk',
      },
    ],
    [submittedComplaints],
  )

  useEffect(() => {
    let cancelled = false

    async function loadComplaints() {
      try {
        const complaints = await fetchComplaints()
        if (cancelled) return
        setSubmittedComplaints(complaints.map((complaint) => buildStoredSubmittedComplaint(complaint)))
      } catch {
        // Keep current dashboard data if the API is unavailable.
      }
    }

    void loadComplaints()
    return () => {
      cancelled = true
    }
  }, [setSubmittedComplaints])

  return (
    <PageContainer className="gap-8">
      <SectionHeader
        title={dashboardPageCopy.title}
        description={dashboardPageCopy.description}
      />

      <DashboardSection
        title={dashboardPageCopy.overviewTitle}
        description={dashboardPageCopy.overviewDescription}
      >
        <StatGrid columns={4}>
          {dashboardMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              hint={metric.hint}
            />
          ))}
        </StatGrid>
      </DashboardSection>

      <DashboardSection
        title={dashboardPageCopy.severitySectionTitle}
        description={dashboardPageCopy.severitySectionDescription}
      >
        <ChartContainer
          title={dashboardSeverityChart.title}
          description={dashboardSeverityChart.description}
        />
      </DashboardSection>

      <ComplaintListSection
        title={dashboardPageCopy.recentComplaintsTitle}
        description={dashboardPageCopy.recentComplaintsDescription}
        items={recentComplaints}
        onItemClick={(item) => navigate(routes.complaintDetail(item.id))}
      />
    </PageContainer>
  )
}
