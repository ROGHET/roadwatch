import { BarChart3 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { fadeInUp } from '../../lib/motion'

export type ChartContainerProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  contentClassName?: string
  minHeightClassName?: string
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  contentClassName,
  minHeightClassName = 'min-h-48',
}: ChartContainerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
    >
      <Card interactive className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent
          className={twMerge(
            'flex items-center justify-center rounded-lg border border-dashed border-[var(--rw-border)] bg-[var(--rw-surface-muted)] transition-colors duration-200',
            minHeightClassName,
            contentClassName,
          )}
        >
          {children ?? (
            <div
              className="flex flex-col items-center gap-2 px-4 py-8 text-center text-[var(--rw-text-secondary)]"
              role="img"
              aria-label="Chart placeholder"
            >
              <BarChart3 className="size-8 text-[var(--rw-text-tertiary)]" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--rw-text-primary)]">Chart area</p>
              <p className="text-xs">Visualization will render here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
