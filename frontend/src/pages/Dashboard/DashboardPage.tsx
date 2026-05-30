import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { MetricCard } from '../../components/charts/MetricCard'
import { StatGrid } from '../../components/charts/StatGrid'
import { AnimatedCounter } from '../../components/common/AnimatedCounter'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { AnalyticsDashboardSections } from '../../components/dashboard/AnalyticsDashboardSections'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { dashboardPageCopy } from '../../data/dashboard'
import { fetchComplaints } from '../../lib/api/complaints'
import { getRecentIntelligenceItems } from '../../lib/complaints/mergedComplaints'
import { routes } from '../../lib/routes'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../../stores/complaintStore'
import { useMapStore } from '../../stores/mapStore'
import type { ComplaintSeverity } from '../../components/complaints/ComplaintCard'

function matchesSeverityFilter(severity: ComplaintSeverity | undefined, filters: ComplaintSeverity[]) {
  if (filters.length === 0) return true
  return filters.includes(severity ?? 'medium')
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)
  const severityFilters = useMapStore((state) => state.severityFilters)
  const filteredComplaints = useMemo(
    () =>
      submittedComplaints.filter((entry) =>
        matchesSeverityFilter(entry.marker.severity, severityFilters),
      ),
    [severityFilters, submittedComplaints],
  )
  const recentComplaints = getRecentIntelligenceItems(filteredComplaints, 6)
  const dashboardMetrics = useMemo(
    () => [
      {
        id: 'total-complaints',
        label: 'Total Complaints',
        value: filteredComplaints.length,
        icon: ClipboardList,
        hint: 'Stored complaint records',
      },
      {
        id: 'pending-complaints',
        label: 'Pending',
        value: filteredComplaints.filter((entry) =>
          ['pending', 'routed', 'in_review'].includes(entry.marker.status),
        ).length,
        icon: Clock,
        hint: 'Awaiting authority action',
      },
      {
        id: 'resolved-complaints',
        label: 'Resolved',
        value: filteredComplaints.filter((entry) => entry.marker.status === 'resolved').length,
        icon: CheckCircle2,
        hint: 'Closed complaint records',
      },
      {
        id: 'critical-open',
        label: 'Critical Open',
        value: filteredComplaints.filter(
          (entry) => entry.marker.severity === 'critical' && entry.marker.status !== 'resolved',
        ).length,
        icon: AlertTriangle,
        hint: 'Immediate safety risk',
      },
    ],
    [filteredComplaints],
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
        title="Analytics Dashboard"
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
              value={<AnimatedCounter value={metric.value} duration={1000} />}
              icon={metric.icon}
              hint={metric.hint}
            />
          ))}
        </StatGrid>
      </DashboardSection>

      <AnalyticsDashboardSections />

      <ComplaintListSection
        title={dashboardPageCopy.recentComplaintsTitle}
        description={dashboardPageCopy.recentComplaintsDescription}
        items={recentComplaints}
        onItemClick={(item) => navigate(routes.complaintDetail(item.id))}
      />
    </PageContainer>
  )
}
