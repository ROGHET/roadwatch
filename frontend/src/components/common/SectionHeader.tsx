import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { fadeInUp } from '../../lib/motion'

export type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.header
      className={twMerge(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-32px' }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2
          className={twMerge(
            'text-xl font-semibold tracking-tight text-[var(--rw-text-primary)]',
            titleClassName,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={twMerge(
              'text-sm text-[var(--rw-text-secondary)]',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.header>
  )
}
