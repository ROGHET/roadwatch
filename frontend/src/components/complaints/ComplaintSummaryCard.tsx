import { FileText, MapPin } from 'lucide-react'
import { type ReactNode } from 'react'
import { useI18n } from '../../lib/i18n'
import { Badge } from '../common/Badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../common/Card'
import {
  ComplaintStatusBadge,
  type ComplaintStatus,
} from './ComplaintStatusBadge'
import { ComplaintRoutingInfo } from './ComplaintRoutingInfo'
import { type ComplaintSeverity } from './ComplaintCard'

export type ComplaintSummaryCardProps = {
  title: string
  referenceId?: string
  roadName?: string
  roadType?: string
  issueType?: string
  assignedAuthority?: string
  assignedDepartment?: string
  status: ComplaintStatus
  severity?: ComplaintSeverity
  reportedAt?: string
  updatedAt?: string
  resolutionStatus?: string
  citizenReports?: number
  maintenanceReports?: number
  footer?: ReactNode
  className?: string
}

const severityVariant: Record<
  ComplaintSeverity,
  'secondary' | 'info' | 'warning' | 'danger'
> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

const severityLabel: Record<ComplaintSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function ComplaintSummaryCard({
  title,
  referenceId,
  roadName,
  roadType,
  issueType,
  assignedAuthority,
  assignedDepartment,
  status,
  severity,
  reportedAt,
  updatedAt,
  resolutionStatus,
  citizenReports,
  maintenanceReports,
  footer,
  className,
}: ComplaintSummaryCardProps) {
  const { t } = useI18n()
  
  return (
    <Card interactive className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {referenceId ? (
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                {referenceId}
              </p>
            ) : null}
            <CardTitle className="break-words text-base leading-snug">{title}</CardTitle>
          </div>
          <ComplaintStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {roadName ? (
          <CardDescription className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{roadName}</span>
          </CardDescription>
        ) : null}
        {roadType || issueType || assignedAuthority || assignedDepartment ? (
          <ComplaintRoutingInfo
            compact
            roadType={roadType}
            issueType={issueType}
            assignedAuthority={assignedAuthority}
            assignedDepartment={assignedDepartment}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {severity ? (
            <Badge variant={severityVariant[severity]}>{severityLabel[severity]} {t('severity')}</Badge>
          ) : null}
          {resolutionStatus ? (
            <Badge variant="secondary" className="capitalize">
              {resolutionStatus}
            </Badge>
          ) : null}
        </div>
        {citizenReports || maintenanceReports ? (
          <p className="text-xs text-[var(--rw-text-tertiary)]">
            {citizenReports ? `${citizenReports} ${t('citizenReports')}` : t('citizenReportsLogged')}
            {maintenanceReports ? ` - ${maintenanceReports} ${t('maintenanceNotes')}` : ''}
          </p>
        ) : null}
        {reportedAt ? (
          <p className="text-xs text-[var(--rw-text-tertiary)]">
            {t('reportedAt')}<time>{reportedAt}</time>
          </p>
        ) : null}
        {updatedAt ? (
          <p className="text-xs text-[var(--rw-text-tertiary)]">
            {t('updatedAt')}<time>{updatedAt}</time>
          </p>
        ) : null}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}
