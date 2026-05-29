import { forwardRef, type LabelHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={twMerge(
        'text-sm font-medium leading-none text-[var(--rw-text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span className="text-[var(--rw-danger)]" aria-hidden="true">
            {' '}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  ),
)

Label.displayName = 'Label'
