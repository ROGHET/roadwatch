import { CircleCheck, CircleDashed, CircleX, Construction, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeProps } from '../common/Badge'
import { twMerge } from 'tailwind-merge'

export type RoadStatus = 'open' | 'under_repair' | 'closed' | 'unknown'

export type RoadStatusBadgeProps = {
  status: RoadStatus
  className?: string
}

const statusConfig: Record<
  RoadStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']>; icon: LucideIcon }
> = {
  open: { label: 'Open', variant: 'success', icon: CircleCheck },
  under_repair: { label: 'Under Repair', variant: 'warning', icon: Construction },
  closed: { label: 'Closed', variant: 'danger', icon: CircleX },
  unknown: { label: 'Unknown', variant: 'secondary', icon: CircleDashed },
}

export function RoadStatusBadge({ status, className }: RoadStatusBadgeProps) {
  const { label, variant, icon: Icon } = statusConfig[status]

  return (
    <Badge variant={variant} className={twMerge('gap-1.5', className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  )
}
