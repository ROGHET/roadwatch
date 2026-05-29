import { motion, useReducedMotion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { cardHover, staggerItem } from '../../lib/motion'

export type MetricCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  className?: string
}

export function MetricCard({ label, value, icon: Icon, hint, className }: MetricCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : staggerItem}
      whileHover={prefersReducedMotion ? undefined : cardHover}
      className="h-full"
    >
      <Card interactive className={className}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[var(--rw-text-secondary)]">
            {label}
          </CardTitle>
          <div
            className="flex size-9 items-center justify-center rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] transition-colors duration-200 group-hover:border-[var(--rw-border-strong)]"
            aria-hidden="true"
          >
            <Icon className="size-5 text-[var(--rw-text-secondary)]" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--rw-text-primary)]">
            {value}
          </p>
          {hint ? <CardDescription className="mt-1">{hint}</CardDescription> : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}
