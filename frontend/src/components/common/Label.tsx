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
        'text-sm font-medium leading-none text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-50',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span className="text-red-600 dark:text-red-400" aria-hidden="true">
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
