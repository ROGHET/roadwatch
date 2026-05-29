import { Map } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export type MapPlaceholderProps = {
  title?: string
  description?: string
  className?: string
  minHeightClassName?: string
}

export function MapPlaceholder({
  title = 'Interactive Map',
  description = 'Road map visualization will render here',
  className,
  minHeightClassName = 'min-h-64 sm:min-h-80',
}: MapPlaceholderProps) {
  return (
    <div
      className={twMerge(
        'flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-900/50',
        minHeightClassName,
        className,
      )}
      role="img"
      aria-label={title}
    >
      <div
        className="flex size-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800"
        aria-hidden="true"
      >
        <Map className="size-7 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  )
}
