import { forwardRef, type SelectHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const selectChevronClassName =
  "appearance-none bg-[length:1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"

const selectBaseClassName =
  'flex h-10 w-full min-w-0 cursor-pointer rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface)] pl-3 text-base text-[var(--rw-text-primary)] shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm'

const selectErrorClassName =
  'border-[var(--rw-danger)] focus-visible:outline-[var(--rw-danger)]'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      className={twMerge(
        selectBaseClassName,
        selectChevronClassName,
        error && selectErrorClassName,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)

Select.displayName = 'Select'
