import { MapPin } from 'lucide-react'
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
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
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
        </div>
        {reportedAt ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reported: <time>{reportedAt}</time>
          </p>
        ) : null}
      </CardContent>
      {footer ? <CardFooter className={twMerge('pt-0')}>{footer}</CardFooter> : null}
    </Card>
  )
}
