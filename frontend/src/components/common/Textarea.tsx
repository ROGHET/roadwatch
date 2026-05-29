import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const textareaBaseClassName =
  'flex min-h-24 w-full min-w-0 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:outline-slate-100 sm:text-sm'

const textareaErrorClassName =
  'border-red-500 focus-visible:outline-red-600 dark:border-red-500 dark:focus-visible:outline-red-400'

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
