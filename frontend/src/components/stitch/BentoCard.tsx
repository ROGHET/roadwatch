import { type LucideIcon } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type BentoCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  icon: LucideIcon
  accentClassName?: string
  iconBgClassName?: string
}

export const BentoCard = forwardRef<HTMLButtonElement, BentoCardProps>(
  (
    {
      label,
      icon: Icon,
      className,
      accentClassName = 'text-[var(--st-primary)]',
      iconBgClassName = 'bg-[var(--st-primary)]/10',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={twMerge(
        'rw-glass-panel rw-glass-edge rw-glass-interactive group flex w-full flex-col items-center gap-3 rounded-2xl p-4 text-center transition-transform active:scale-95',
        className,
      )}
      {...props}
    >
      <div
        className={twMerge(
          'flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110',
          iconBgClassName,
        )}
      >
        <Icon className={twMerge('size-5', accentClassName)} aria-hidden="true" />
      </div>
      <span className="rw-type-label-caps text-[var(--st-on-surface)]">{label}</span>
    </button>
  ),
)

BentoCard.displayName = 'BentoCard'
