import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { GlassPanel } from './GlassPanel'

export type MetricCardProps = {
  label: string
  value: ReactNode
  meta?: ReactNode
  description?: string
  icon?: LucideIcon
  accentClassName?: string
  progress?: number
  className?: string
  onClick?: () => void
}

export function MetricCard({
  label,
  value,
  meta,
  description,
  icon: Icon,
  accentClassName = 'text-[var(--st-tertiary)]',
  progress,
  className,
  onClick,
}: MetricCardProps) {
  const content = (
    <>
      {Icon ? (
        <div className="pointer-events-none absolute right-4 top-4 opacity-20" aria-hidden="true">
          <Icon className="size-14 text-[var(--st-on-surface)]" />
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <span className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className={twMerge('font-serif text-4xl', accentClassName)}>{value}</span>
          {meta ? <span className="rw-type-metadata opacity-60">{meta}</span> : null}
        </div>
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[var(--st-tertiary)] shadow-[0_0_12px_rgba(0,228,117,0.4)]"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {description ? (
        <p className="mt-4 text-[15px] leading-snug text-[var(--st-on-surface-variant)]">{description}</p>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
      >
        <GlassPanel
          className={twMerge('relative overflow-hidden rounded-3xl p-6', className)}
          interactive
        >
          {content}
        </GlassPanel>
      </button>
    )
  }

  return (
    <GlassPanel className={twMerge('relative overflow-hidden rounded-3xl p-6', className)} interactive>
      {content}
    </GlassPanel>
  )
}
