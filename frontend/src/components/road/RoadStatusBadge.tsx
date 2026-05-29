import { CircleCheck, CircleDashed, CircleX, Construction, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeProps } from '../common/Badge'
import { twMerge } from 'tailwind-merge'
import { useI18n } from '../../lib/i18n'

export type RoadStatus = 'open' | 'under_repair' | 'closed' | 'unknown'

export type RoadStatusBadgeProps = {
  status: RoadStatus
  className?: string
}

const getStatusConfig = (t: any): Record<
  RoadStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']>; icon: LucideIcon }
> => ({
  open: { label: t('open'), variant: 'success', icon: CircleCheck },
  under_repair: { label: t('underRepair'), variant: 'warning', icon: Construction },
  closed: { label: t('closed'), variant: 'danger', icon: CircleX },
  unknown: { label: t('unknown'), variant: 'secondary', icon: CircleDashed },
})

export function RoadStatusBadge({ status, className }: RoadStatusBadgeProps) {
  const { t } = useI18n()
  const { label, variant, icon: Icon } = getStatusConfig(t)[status]

  return (
    <Badge variant={variant} className={twMerge('gap-1.5', className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  )
}
