import { forwardRef, type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const inputBaseClassName =
  'flex h-10 w-full min-w-0 rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface)] px-3 py-2 text-base text-[var(--rw-text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--rw-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-sm'

const inputErrorClassName =
  'border-[var(--rw-danger)] focus-visible:outline-[var(--rw-danger)]'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      className={twMerge(inputBaseClassName, error && inputErrorClassName, className)}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
