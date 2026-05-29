import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <header
      className={twMerge(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2
          className={twMerge(
            'text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50',
            titleClassName,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={twMerge(
              'text-sm text-slate-500 dark:text-slate-400',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
