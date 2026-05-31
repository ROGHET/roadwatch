import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { selectComplaintMetrics } from '../../lib/complaints/complaintSelectors'
import { getRecentIntelligenceItems } from '../../lib/complaints/mergedComplaints'
import { routes } from '../../lib/routes'
import { useComplaintStore } from '../../stores/complaintStore'
import { useMapStore } from '../../stores/mapStore'
import type { ComplaintSeverity } from '../../components/complaints/ComplaintCard'

function matchesSeverityFilter(severity: ComplaintSeverity | undefined, filters: ComplaintSeverity[]) {
  if (filters.length === 0) return true
  return filters.includes(severity ?? 'medium')
}

export default function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const severityFilters = useMapStore((state) => state.severityFilters)
  const filteredComplaints = useMemo(
    () =>
      submittedComplaints.filter((entry) =>
        matchesSeverityFilter(entry.marker.severity, severityFilters),
      ),
    [severityFilters, submittedComplaints],
  )
  const recentComplaints = getRecentIntelligenceItems(filteredComplaints, 6)
  const dashboardMetrics = useMemo(() => {
    const metrics = selectComplaintMetrics(submittedComplaints)
    return [
      {
        id: 'total-complaints',
        label: 'Total Complaints',
        value: metrics.total,
        icon: ClipboardList,
        hint: 'Stored complaint records',
        href: routes.complaintHistory,
      },
      {
        id: 'closed-complaints',
        label: 'Closed',
        value: metrics.closed,
        icon: CheckCircle2,
        hint: `${metrics.closedPercent}% closed`,
        href: `${routes.complaintHistory}?status=resolved`,
      },
      {
        id: 'in-progress-complaints',
        label: 'In Progress',
        value: metrics.inProgress,
        icon: Clock,
        hint: `${metrics.inProgressPercent}% in progress`,
        href: `${routes.complaintHistory}?status=in_review`,
      },
      {
        id: 'critical-open',
        label: 'Critical Open',
        value: metrics.critical,
        icon: AlertTriangle,
        hint: `${metrics.pendingPercent}% pending`,
        href: `${routes.complaintHistory}?severity=critical`,
      },
    ]
  }, [submittedComplaints])

  useEffect(() => {
    if (!location.hash) return
    const target = document.querySelector(location.hash)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

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
              onClick={() => navigate(metric.href)}
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
