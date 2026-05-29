import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import type { MetricCardProps } from '../components/charts/MetricCard'
import type { ChartContainerProps } from '../components/charts/ChartContainer'
import type { ComplaintListItem } from '../components/complaints/ComplaintListSection'
import { mockComplaintSummaries } from './complaints'

export type DashboardMetric = Pick<MetricCardProps, 'label' | 'value' | 'hint'> & {
  id: string
  icon: LucideIcon
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: 'total-complaints',
    label: 'Total Complaints',
    value: 248,
    icon: ClipboardList,
    hint: 'Across Tamil Nadu pilot corridors',
  },
  {
    id: 'pending-complaints',
    label: 'Pending',
    value: 56,
    icon: Clock,
    hint: 'Awaiting authority action',
  },
  {
    id: 'resolved-complaints',
    label: 'Resolved',
    value: 162,
    icon: CheckCircle2,
    hint: 'Closed since April 2026',
  },
  {
    id: 'critical-open',
    label: 'Critical Open',
    value: 9,
    icon: AlertTriangle,
    hint: 'Immediate safety risk',
  },
]

export const dashboardRecentComplaints: ComplaintListItem[] = mockComplaintSummaries.slice(
  0,
  6,
)

export const dashboardSeverityChart: Pick<ChartContainerProps, 'title' | 'description'> = {
  title: 'Complaints by Severity',
  description:
    'Open complaints across NH, SH, and MDR networks in the Chennai metropolitan region.',
}

export const dashboardPageCopy = {
  title: 'Authority Dashboard',
  description:
    'Monitor pending complaints, resolution progress, and severity distribution for connected road authorities.',
  overviewTitle: 'Overview',
  overviewDescription: 'Snapshot of complaint volume and status for the current reporting period.',
  severitySectionTitle: 'Severity Breakdown',
  severitySectionDescription:
    'Distribution of open complaints by severity level across all jurisdictions.',
  recentComplaintsTitle: 'Recent Complaints',
  recentComplaintsDescription:
    'Latest citizen submissions routed to NHAI, State PWD, and district authorities.',
} as const
