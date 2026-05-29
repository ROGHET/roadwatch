import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  className?: string
  showCloseButton?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)

    return () => {
      dialog.removeEventListener('cancel', handleCancel)
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-50 m-0 h-dvh w-full max-h-none max-w-none border-none bg-transparent p-0 backdrop:bg-black/60"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className={twMerge(
            'relative w-full max-w-lg rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface)] p-6 text-[var(--rw-text-primary)] shadow-xl',
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-semibold leading-none tracking-tight">
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
                aria-label="Close dialog"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </dialog>
  )
}
