import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { stitchMotion } from '../../styles/stitchTokens'

export type SidebarSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function SidebarSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: SidebarSheetProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[450] bg-black/35 lg:hidden"
            aria-label="Close panel"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className={twMerge(
              'rw-glass-panel rw-glass-edge fixed inset-x-0 bottom-0 z-[500] flex max-h-[min(78dvh,34rem)] flex-col rounded-t-[24px] shadow-[var(--st-shadow-glass)] lg:inset-x-auto lg:bottom-auto lg:right-[var(--st-floating-offset)] lg:top-24 lg:max-h-[calc(100%-7rem)] lg:w-[min(26rem,calc(100vw-2rem))] lg:rounded-[24px]',
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={prefersReducedMotion ? false : { x: 24, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { x: 24, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : stitchMotion.sheet}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--st-outline-white)] px-5 py-4">
              <div className="min-w-0">
                {subtitle ? (
                  <p className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{subtitle}</p>
                ) : null}
                <h2 className="font-serif text-xl text-[var(--st-on-surface)]">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-9 items-center justify-center rounded-full text-[var(--st-on-surface-variant)] transition-colors hover:bg-white/10 hover:text-[var(--st-on-surface)]"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
