import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import {
  getBudgetUtilizationStats,
  getComplaintCategoryStats,
  getMaxCategoryCount,
  getMaxMonthlyCount,
  getMonthlyTrendStats,
  getResolutionStatusStats,
  getTotalStatusCount,
} from '../../lib/analytics/dashboardAnalytics'

function ProgressBar({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string
  value: number
  max: number
  color: string
  suffix?: string
}) {
  const width = Math.round((value / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--rw-text-secondary)]">{label}</span>
        <span className="font-medium tabular-nums text-[var(--rw-text-primary)]">
          {value}
          {suffix ?? ''}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--rw-surface-muted)]">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function AnalyticsDashboardSections() {
  const categories = getComplaintCategoryStats()
  const statuses = getResolutionStatusStats()
  const monthlyTrends = getMonthlyTrendStats()
  const budget = getBudgetUtilizationStats()
  const maxCategory = getMaxCategoryCount(categories)
  const maxMonthly = getMaxMonthlyCount(monthlyTrends)
  const totalStatus = getTotalStatusCount(statuses)
  const resolvedCount = statuses.find((entry) => entry.label === 'Resolved')?.count ?? 0
  const resolvedPercent = totalStatus > 0 ? Math.round((resolvedCount / totalStatus) * 100) : 0

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rw-glass-panel rw-glass-edge shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]">
        <CardHeader>
          <CardTitle className="text-base">Complaint Categories</CardTitle>
          <CardDescription>Open complaints grouped by issue type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((entry) => (
            <ProgressBar
              key={entry.label}
              label={entry.label}
              value={entry.count}
              max={maxCategory}
              color={entry.color}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]">
        <CardHeader>
          <CardTitle className="text-base">Resolution Status</CardTitle>
          <CardDescription>Distribution of complaint lifecycle states.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative mx-auto min-h-[12rem] w-full min-w-0">
            <ResponsiveContainer width="100%" height={192} minWidth={0}>
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {statuses.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums text-[var(--rw-text-primary)]">
                {resolvedPercent}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {statuses.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-[var(--rw-text-secondary)]">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  {entry.label}
                </span>
                <span className="font-medium tabular-nums text-[var(--rw-text-primary)]">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]">
        <CardHeader>
          <CardTitle className="text-base">Monthly Trends</CardTitle>
          <CardDescription>Complaint volume by reporting month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyTrends.map((entry) => (
            <ProgressBar
              key={entry.month}
              label={entry.month}
              value={entry.count}
              max={maxMonthly}
              color="var(--st-primary)"
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]">
        <CardHeader>
          <CardTitle className="text-base">Budget Utilization</CardTitle>
          <CardDescription>Aggregated sanctioned and spent road budgets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--rw-text-tertiary)]">Allocated</p>
              <p className="mt-1 text-xl font-semibold text-[var(--st-tertiary)]">
                ₹{budget.allocatedCr.toFixed(1)}Cr
              </p>
            </div>
            <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--rw-text-tertiary)]">Spent</p>
              <p className="mt-1 text-xl font-semibold text-[var(--st-secondary)]">
                ₹{budget.spentCr.toFixed(1)}Cr
              </p>
            </div>
            <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--rw-text-tertiary)]">Remaining</p>
              <p className="mt-1 text-xl font-semibold text-[var(--rw-text-primary)]">
                ₹{budget.remainingCr.toFixed(1)}Cr
              </p>
            </div>
          </div>
          <ProgressBar
            label="Utilisation"
            value={budget.utilizationPercent}
            max={100}
            color="var(--st-tertiary)"
            suffix="%"
          />
          <p className="text-xs text-[var(--rw-text-secondary)]">
            ₹{budget.allocatedCr.toFixed(1)} Cr total across published corridor budgets.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
