import {
  AlertOctagon,
  AlertTriangle,
  Shield,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useI18n } from '../../lib/i18n'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type RiskIndicatorProps = {
  level: RiskLevel
  label?: string
  className?: string
}

const getRiskConfig = (t: any): Record<
  RiskLevel,
  { label: string; icon: LucideIcon; className: string }
> => ({
  low: {
    label: t('lowRisk'),
    icon: Shield,
    className: 'text-emerald-700 dark:text-emerald-300',
  },
  medium: {
    label: t('mediumRisk'),
    icon: ShieldAlert,
    className: 'text-amber-700 dark:text-amber-300',
  },
  high: {
    label: t('highRisk'),
    icon: AlertTriangle,
    className: 'text-orange-700 dark:text-orange-300',
  },
  critical: {
    label: t('criticalRisk'),
    icon: AlertOctagon,
    className: 'text-red-700 dark:text-red-300',
  },
})

export function RiskIndicator({ level, label, className }: RiskIndicatorProps) {
  const { t } = useI18n()
  const config = getRiskConfig(t)[level]
  const Icon = config.icon
  const displayLabel = label ?? config.label

  return (
    <div
      className={twMerge('inline-flex items-center gap-2 text-sm font-medium', className)}
      role="status"
      aria-label={displayLabel}
    >
      <Icon className={twMerge('size-5 shrink-0', config.className)} aria-hidden="true" />
      <span className={config.className}>{displayLabel}</span>
    </div>
  )
}
