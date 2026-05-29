import { FileText, MapPin } from 'lucide-react'
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
import {
  ComplaintStatusBadge,
  type ComplaintStatus,
} from './ComplaintStatusBadge'
import { type ComplaintSeverity } from './ComplaintCard'

export type ComplaintSummaryCardProps = {
  title: string
  referenceId?: string
  roadName?: string
  status: ComplaintStatus
  severity?: ComplaintSeverity
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

export function ComplaintSummaryCard({
  title,
  referenceId,
  roadName,
  status,
  severity,
  reportedAt,
  footer,
  className,
}: ComplaintSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {referenceId ? (
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                {referenceId}
              </p>
            ) : null}
            <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
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
        <div className="flex flex-wrap items-center gap-2">
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
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}
