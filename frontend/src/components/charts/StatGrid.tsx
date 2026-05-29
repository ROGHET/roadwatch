import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type StatGridProps = {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

const columnClassName: Record<NonNullable<StatGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function StatGrid({ children, columns = 2, className }: StatGridProps) {
  return (
    <div
      className={twMerge('grid gap-4', columnClassName[columns], className)}
      role="list"
    >
      {children}
    </div>
  )
}
