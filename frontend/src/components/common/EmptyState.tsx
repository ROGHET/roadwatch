import { motion, useReducedMotion } from 'framer-motion'
import { Inbox, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { fadeInUp, iconFloat, scaleIn } from '../../lib/motion'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={twMerge(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--rw-border)] bg-[var(--rw-surface-muted)] px-4 py-12 text-center',
        className,
      )}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
    >
      <motion.div
        className="flex size-14 items-center justify-center rounded-full border border-[var(--rw-border)] bg-[var(--rw-surface)]"
        variants={prefersReducedMotion ? undefined : scaleIn}
        aria-hidden="true"
      >
        <motion.div variants={prefersReducedMotion ? undefined : iconFloat} animate="animate">
          <Icon className="size-7 text-[var(--rw-text-tertiary)]" />
        </motion.div>
      </motion.div>
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">{title}</h3>
        {description ? (
          <p className="text-sm text-[var(--rw-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {action ? (
        <motion.div
          className="mt-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  )
}
