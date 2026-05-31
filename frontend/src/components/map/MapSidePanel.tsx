import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type MapSidePanelProps = {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  className?: string
  closeLabel?: string
  headerExtra?: ReactNode
}

/**
 * Shared layout for map overlays: Location Intelligence, complaint filters,
 * marker details, and future side panels.
 */
export function MapSidePanel({
  title,
  onClose,
  children,
  footer,
  className,
  closeLabel = 'Close details',
  headerExtra,
}: MapSidePanelProps) {
  return (
    <aside
      className={twMerge(
        'pointer-events-auto absolute inset-x-0 z-[500] flex flex-col overflow-hidden',
        // Mobile: appear from bottom, respect top nav safe area, never clip close button
        'top-auto bottom-0 max-h-[75dvh]',
        'pb-[env(safe-area-inset-bottom)]',
        // Desktop: right side panel
        'lg:inset-x-auto lg:top-[calc(var(--st-floating-offset)+4.5rem)] lg:bottom-4 lg:right-4',
        'lg:h-auto lg:max-h-[calc(100dvh-var(--st-floating-offset)-5.5rem)] lg:w-[min(26rem,calc(100vw-2rem))]',
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="rw-map-glass flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-t-[1.5rem] shadow-[0_24px_80px_-28px_rgb(0_0_0/0.55)] lg:rounded-[1.5rem]">
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[var(--rw-border-strong)] lg:hidden"
          aria-hidden="true"
        />

        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--st-outline-white)] bg-[var(--rw-surface)]/90 px-4 py-3 backdrop-blur-md lg:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
              {title}
            </p>
            {headerExtra}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label={closeLabel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 lg:px-5">
          {children}
        </div>

        <footer className="shrink-0 border-t border-[var(--st-outline-white)] bg-[var(--rw-surface)]/95 p-4 backdrop-blur-md">
          {footer}
        </footer>
      </div>
    </aside>
  )
}
