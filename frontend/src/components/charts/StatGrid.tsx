import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { staggerContainer } from '../../lib/motion'

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
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={twMerge('grid gap-4', columnClassName[columns], className)}
      role="list"
      variants={prefersReducedMotion ? undefined : staggerContainer}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  )
}
