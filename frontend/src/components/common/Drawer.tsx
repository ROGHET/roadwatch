import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  side?: 'left' | 'right' | 'bottom'
  className?: string
  showCloseButton?: boolean
}

const sidePanelClassName: Record<NonNullable<DrawerProps['side']>, string> = {
  left: 'inset-y-0 left-0 h-full w-full max-w-sm border-r',
  right: 'inset-y-0 right-0 h-full w-full max-w-sm border-l',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[85dvh] rounded-t-lg border-t',
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  side = 'right',
  className,
  showCloseButton = true,
}: DrawerProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="fixed inset-0 bg-black/60"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={twMerge(
          'fixed flex flex-col border-[var(--rw-border)] bg-[var(--rw-surface)] text-[var(--rw-text-primary)] shadow-xl',
          sidePanelClassName[side],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--rw-border)] p-4 sm:p-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--rw-text-primary)]">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-2 text-sm text-[var(--rw-text-secondary)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--rw-text-secondary)] transition-colors hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
              aria-label="Close drawer"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {children ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        ) : null}
      </div>
    </div>
  )
}
