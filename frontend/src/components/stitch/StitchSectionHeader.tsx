import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type StitchSectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function StitchSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: StitchSectionHeaderProps) {
  return (
    <header className={twMerge('flex items-start justify-between gap-3 px-1', className)}>
      <div className="min-w-0 flex flex-col gap-1">
        {eyebrow ? (
          <span className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{eyebrow}</span>
        ) : null}
        {title ? (
          <h2 className="font-serif text-2xl text-[var(--st-on-surface)]">{title}</h2>
        ) : null}
        {description ? (
          <p className="text-[15px] text-[var(--st-on-surface-variant)]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  )
}
