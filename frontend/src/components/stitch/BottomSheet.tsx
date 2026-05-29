import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { stitchMotion } from '../../styles/stitchTokens'

export type BottomSheetProps = {
  open: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function BottomSheet({ open, title, children, className }: BottomSheetProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className={twMerge(
            'rw-glass-panel rw-glass-edge fixed inset-x-0 bottom-0 z-[500] mx-auto flex max-h-[min(78dvh,34rem)] w-full max-w-lg flex-col rounded-t-[24px] shadow-[var(--st-shadow-glass)] lg:inset-x-auto lg:bottom-auto lg:left-[var(--st-safe-margin)] lg:top-24 lg:max-h-[calc(100%-7rem)] lg:w-[420px] lg:rounded-[24px]',
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={prefersReducedMotion ? false : { y: '100%', opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { y: '100%', opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : stitchMotion.sheet}
        >
          <div
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 lg:hidden"
            aria-hidden="true"
          />
          {title ? (
            <div className="border-b border-[var(--st-outline-white)] px-5 py-3">
              <p className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{title}</p>
            </div>
          ) : null}
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
