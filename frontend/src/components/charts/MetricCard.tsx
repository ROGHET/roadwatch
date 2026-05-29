import { type LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'

export type MetricCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  className?: string
}

export function MetricCard({ label, value, icon: Icon, hint, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </CardTitle>
        <div
          className="flex size-9 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800"
          aria-hidden="true"
        >
          <Icon className="size-5 text-slate-700 dark:text-slate-300" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint ? <CardDescription className="mt-1">{hint}</CardDescription> : null}
      </CardContent>
    </Card>
  )
}
