import { ClipboardList } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { EmptyState } from '../common/EmptyState'
import { SectionHeader } from '../common/SectionHeader'
import {
  ComplaintSummaryCard,
  type ComplaintSummaryCardProps,
} from './ComplaintSummaryCard'

export type ComplaintListItem = ComplaintSummaryCardProps & {
  id: string
}

export type ComplaintListSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  items: ComplaintListItem[]
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
  emptyTitle = 'No complaints',
  emptyDescription = 'Complaints will appear here once submitted.',
  className,
  listClassName,
}: ComplaintListSectionProps) {
  return (
    <section className={twMerge('flex flex-col gap-4', className)} aria-label={title}>
      <SectionHeader title={title} description={description} action={action} />

      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <ul
          className={twMerge('grid gap-4 sm:grid-cols-2', listClassName)}
          role="list"
        >
          {items.map(({ id, ...item }) => (
            <li key={id} role="listitem">
              <ComplaintSummaryCard {...item} className="h-full" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
