import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const textareaBaseClassName =
  'flex min-h-24 w-full min-w-0 resize-y rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface)] px-[var(--rw-input-padding)] py-[var(--rw-input-padding)] text-base text-[var(--rw-text-primary)] shadow-sm transition-colors placeholder:text-[var(--rw-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm'

const textareaErrorClassName =
  'border-[var(--rw-danger)] focus-visible:outline-[var(--rw-danger)]'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      className={twMerge(textareaBaseClassName, error && textareaErrorClassName, className)}
      {...props}
    />
  ),
)

Textarea.displayName = 'Textarea'
