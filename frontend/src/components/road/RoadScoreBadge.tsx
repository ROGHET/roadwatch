import { Badge, type BadgeProps } from '../common/Badge'
import { twMerge } from 'tailwind-merge'

export type RoadScoreTier = 'excellent' | 'good' | 'fair' | 'poor'

export type RoadScoreBadgeProps = {
  score: number
  tier: RoadScoreTier
  className?: string
}

const tierVariant: Record<RoadScoreTier, NonNullable<BadgeProps['variant']>> = {
  excellent: 'success',
  good: 'info',
  fair: 'warning',
  poor: 'danger',
}

const tierLabel: Record<RoadScoreTier, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export function RoadScoreBadge({ score, tier, className }: RoadScoreBadgeProps) {
  return (
    <Badge
      variant={tierVariant[tier]}
      className={twMerge('gap-1 tabular-nums', className)}
      aria-label={`Road score ${score}, ${tierLabel[tier]}`}
    >
      <span className="font-semibold">{score}</span>
      <span className="opacity-80">/ 100</span>
    </Badge>
  )
}
