import { Clock, CheckCircle2, Route, XCircle, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeProps } from '../common/Badge'
import { twMerge } from 'tailwind-merge'

export type ComplaintStatus = 'pending' | 'routed' | 'in_review' | 'resolved' | 'rejected'

export type ComplaintStatusBadgeProps = {
  status: ComplaintStatus
  className?: string
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']>; icon: LucideIcon }
> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  routed: { label: 'Routed', variant: 'info', icon: Route },
  in_review: { label: 'In Review', variant: 'secondary', icon: Clock },
  resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
}

export function ComplaintStatusBadge({ status, className }: ComplaintStatusBadgeProps) {
  const { label, variant, icon: Icon } = statusConfig[status]

  return (
    <Badge variant={variant} className={twMerge('gap-1.5', className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  )
}
