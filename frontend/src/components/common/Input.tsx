import { forwardRef, type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const inputBaseClassName =
  'flex h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:file:text-slate-50 dark:focus-visible:outline-slate-100 sm:h-10 sm:text-sm'

const inputErrorClassName =
  'border-red-500 focus-visible:outline-red-600 dark:border-red-500 dark:focus-visible:outline-red-400'

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
