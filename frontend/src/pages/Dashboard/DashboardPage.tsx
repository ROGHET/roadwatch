import { ChartContainer } from '../../components/charts/ChartContainer'
import { MetricCard } from '../../components/charts/MetricCard'
import { StatGrid } from '../../components/charts/StatGrid'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import {
  dashboardMetrics,
  dashboardPageCopy,
  dashboardRecentComplaints,
  dashboardSeverityChart,
} from '../../data/dashboard'

export default function DashboardPage() {
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
        items={dashboardRecentComplaints}
      />
    </PageContainer>
  )
}
