import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type FloatingActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, label, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={twMerge(
        'inline-flex size-14 items-center justify-center rounded-full bg-[var(--st-primary-container)] text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] transition-transform duration-300 hover:scale-105 active:scale-95',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)

FloatingActionButton.displayName = 'FloatingActionButton'
