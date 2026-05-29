import { Inbox, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center gap-4 px-4 py-12 text-center',
        className,
      )}
    >
      <div
        className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        aria-hidden="true"
      >
        <Icon className="size-7 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        {description ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
