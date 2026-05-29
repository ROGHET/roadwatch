import { motion, useReducedMotion } from 'framer-motion'
import { Map } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { fadeInUp, scaleIn } from '../../lib/motion'

export type MapPlaceholderProps = {
  title?: string
  description?: string
  className?: string
  minHeightClassName?: string
}

export function MapPlaceholder({
  title = 'Interactive Map',
  description = 'Road map visualization will render here',
  className,
  minHeightClassName = 'min-h-64 sm:min-h-80',
}: MapPlaceholderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={twMerge(
        'flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--rw-border)] bg-[var(--rw-surface-muted)] px-4 py-10 text-center transition-colors duration-200 hover:border-[var(--rw-border-strong)]',
        minHeightClassName,
        className,
      )}
      role="img"
      aria-label={title}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={prefersReducedMotion ? undefined : { borderColor: 'var(--rw-border-strong)' }}
    >
      <motion.div
        className="flex size-14 items-center justify-center rounded-full border border-[var(--rw-border)] bg-[var(--rw-surface)]"
        variants={prefersReducedMotion ? undefined : scaleIn}
        aria-hidden="true"
      >
        <Map className="size-7 text-[var(--rw-text-secondary)]" />
      </motion.div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-semibold text-[var(--rw-text-primary)]">{title}</p>
        <p className="text-sm text-[var(--rw-text-secondary)]">{description}</p>
      </div>
    </motion.div>
  )
}
