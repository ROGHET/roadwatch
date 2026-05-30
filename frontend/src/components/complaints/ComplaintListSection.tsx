import { ClipboardList } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { EmptyState } from '../common/EmptyState'
import { SectionHeader } from '../common/SectionHeader'
import {
  ComplaintSummaryCard,
  type ComplaintSummaryCardProps,
} from './ComplaintSummaryCard'
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/motion'

export type ComplaintListItem = ComplaintSummaryCardProps & {
  id: string
}

export type ComplaintListSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  items: ComplaintListItem[]
  onItemClick?: (item: ComplaintListItem) => void
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  listClassName?: string
}

export function ComplaintListSection({
  title,
  description,
  action,
  items,
  onItemClick,
  emptyTitle = 'No complaints',
  emptyDescription = 'Complaints will appear here once submitted.',
  className,
  listClassName,
}: ComplaintListSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className={twMerge('flex flex-col gap-4', className)}
      aria-label={title}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-48px' }}
    >
      <SectionHeader title={title} description={description} action={action} />

      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <motion.ul
          className={twMerge('grid gap-4 sm:grid-cols-2', listClassName)}
          role="list"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          {items.map(({ id, ...item }) => (
            <motion.li key={id} role="listitem" variants={prefersReducedMotion ? undefined : staggerItem}>
              {onItemClick ? (
                <button
                  type="button"
                  onClick={() => onItemClick({ id, ...item })}
                  className="block h-full w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                >
                  <ComplaintSummaryCard {...item} className="h-full" />
                </button>
              ) : (
                <ComplaintSummaryCard {...item} className="h-full" />
              )}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.section>
  )
}
