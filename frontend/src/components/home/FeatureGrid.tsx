import { motion, useReducedMotion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { SectionHeader } from '../common/SectionHeader'
import { staggerContainer, staggerItem } from '../../lib/motion'

export type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  action?: 'expand-map'
}

export type FeatureGridProps = {
  title?: string
  description?: string
  features: FeatureItem[]
  columns?: 2 | 3
  className?: string
  onExpandMap?: () => void
}

const columnClassName: Record<NonNullable<FeatureGridProps['columns']>, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

export function FeatureGrid({
  title,
  description,
  features,
  columns = 3,
  className,
  onExpandMap,
}: FeatureGridProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className={twMerge('flex flex-col gap-6', className)}
      aria-label={title ?? 'Features'}
    >
      {title ? <SectionHeader title={title} description={description} /> : null}
      <motion.ul
        className={twMerge('grid gap-4', columnClassName[columns])}
        role="list"
        variants={prefersReducedMotion ? undefined : staggerContainer}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        {features.map((feature) => {
          const Icon = feature.icon
          const card = (
            <Card interactive className="h-full">
              <CardHeader>
                <div
                  className="mb-3 flex size-10 items-center justify-center rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] transition-colors duration-200"
                  aria-hidden="true"
                >
                  <Icon className="size-5 text-[var(--rw-text-secondary)]" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )

          return (
            <motion.li key={feature.title} role="listitem" variants={prefersReducedMotion ? undefined : staggerItem}>
              {feature.action === 'expand-map' ? (
                <button
                  type="button"
                  onClick={onExpandMap}
                  className="block w-full rounded-xl text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                >
                  {card}
                </button>
              ) : feature.href ? (
                <Link
                  to={feature.href}
                  className="block rounded-xl outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                >
                  {card}
                </Link>
              ) : (
                card
              )}
            </motion.li>
          )
        })}
      </motion.ul>
    </section>
  )
}
