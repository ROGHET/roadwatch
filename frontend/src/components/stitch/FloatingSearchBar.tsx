import { Search } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type FloatingSearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  brand?: ReactNode
  trailing?: ReactNode
  onClear?: () => void
  containerClassName?: string
}

export const FloatingSearchBar = forwardRef<HTMLInputElement, FloatingSearchBarProps>(
  ({ className, brand, trailing, containerClassName, ...props }, ref) => (
    <div
      className={twMerge(
        'rw-glass-panel rw-glass-edge flex items-center gap-3 rounded-full px-4 py-2.5 shadow-[var(--st-shadow-glass)]',
        containerClassName,
      )}
    >
      <Search className="size-5 shrink-0 text-[var(--st-primary)]" aria-hidden="true" />
      {brand ? <div className="shrink-0 font-serif text-lg text-[var(--st-primary)]">{brand}</div> : null}
      <input
        ref={ref}
        className={twMerge(
          'min-w-0 flex-1 bg-transparent text-sm text-[var(--st-on-surface)] placeholder:text-[var(--st-on-surface-variant)] focus:outline-none',
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  ),
)

FloatingSearchBar.displayName = 'FloatingSearchBar'
