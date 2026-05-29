import { BarChart3 } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'

export type ChartContainerProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  contentClassName?: string
  minHeightClassName?: string
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  contentClassName,
  minHeightClassName = 'min-h-48',
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent
        className={twMerge(
          'flex items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50',
          minHeightClassName,
          contentClassName,
        )}
      >
        {children ?? (
          <div
            className="flex flex-col items-center gap-2 px-4 py-8 text-center text-slate-500 dark:text-slate-400"
            role="img"
            aria-label="Chart placeholder"
          >
            <BarChart3 className="size-8" aria-hidden="true" />
            <p className="text-sm font-medium">Chart area</p>
            <p className="text-xs">Visualization will render here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
