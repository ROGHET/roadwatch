import { Clock3, MapPin, ShieldAlert } from 'lucide-react'
import { type ReactNode } from 'react'
import { Badge } from '../common/Badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { twMerge } from 'tailwind-merge'
import {
  ComplaintStatusBadge,
  type ComplaintStatus,
} from './ComplaintStatusBadge'

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ComplaintCardProps = {
  title: string
  description?: string
  roadName?: string
  issueType?: string
  severity?: ComplaintSeverity
  status: ComplaintStatus
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

export function ComplaintCard({
  title,
  description,
  roadName,
  issueType,
  severity,
  status,
  reportedAt,
  updatedAt,
  resolutionStatus,
  citizenReports,
  maintenanceReports,
  footer,
  className,
}: ComplaintCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <ComplaintStatusBadge status={status} />
        </div>
        {description ? <CardDescription className="line-clamp-2">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {roadName ? (
          <p className="flex items-center gap-2 text-sm text-[var(--rw-text-secondary)]">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>{roadName}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {issueType ? (
            <Badge variant="outline" className="capitalize">
              {issueType}
            </Badge>
          ) : null}
          {severity ? (
            <Badge variant={severityVariant[severity]}>{severityLabel[severity]} Severity</Badge>
          ) : null}
          {resolutionStatus ? (
            <Badge variant="secondary" className="capitalize">
              {resolutionStatus}
            </Badge>
          ) : null}
        </div>
        {citizenReports || maintenanceReports ? (
          <p className="flex items-center gap-2 text-xs text-[var(--rw-text-tertiary)]">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            <span>
              {citizenReports ? `${citizenReports} citizen reports` : 'Citizen reports logged'}
              {maintenanceReports ? ` • ${maintenanceReports} maintenance notes` : ''}
            </span>
          </p>
        ) : null}
        {reportedAt ? (
          <p className="text-xs text-[var(--rw-text-tertiary)]">
            Reported: <time>{reportedAt}</time>
          </p>
        ) : null}
        {updatedAt ? (
          <p className="flex items-center gap-1.5 text-xs text-[var(--rw-text-tertiary)]">
            <Clock3 className="size-3.5" aria-hidden="true" />
            <span>
              Updated: <time>{updatedAt}</time>
            </span>
          </p>
        ) : null}
      </CardContent>
      {footer ? <CardFooter className={twMerge('pt-0')}>{footer}</CardFooter> : null}
    </Card>
  )
}
