import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComplaintMetrics } from '../../hooks/useComplaintData'
import { useMapStore } from '../../stores/mapStore'
import { AnimatedCounter } from '../common/AnimatedCounter'
import { routes } from '../../lib/routes'

type MetricTileProps = {
  label: string
  value: ReactNode
  suffix?: string
  accentClassName?: string
  icon: typeof ClipboardList
  onClick?: () => void
  description?: string
}

function MetricTile({ label, value, suffix = '', accentClassName, icon: Icon, onClick, description }: MetricTileProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'relative overflow-hidden rounded-2xl p-4 text-left w-full transition-all duration-200',
        'border border-[var(--rw-border)] bg-[var(--rw-surface)]/80 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgb(0_0_0/0.18)]',
        onClick
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgb(0_0_0/0.28)] hover:border-[var(--rw-border-strong)] active:scale-[0.98]'
          : '',
      ].join(' ')}
    >
      <Icon
        className="pointer-events-none absolute right-3 top-3 size-10 opacity-10"
        aria-hidden="true"
      />
      <p className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{label}</p>
      <p className={`mt-1 font-serif text-3xl tabular-nums ${typeof value === 'number' ? '' : 'text-lg'} ${accentClassName ?? 'text-[var(--st-on-surface)]'}`}>
        {typeof value === 'number' ? <AnimatedCounter value={value} suffix={suffix} duration={1000} /> : value}
      </p>
      {description && (
        <p className="mt-1 text-[10px] text-[var(--rw-text-tertiary)]">{description}</p>
      )}
    </Tag>
  )
}

export function HomeMetricsRow() {
  const navigate = useNavigate()
  const setSeverityFilters = useMapStore((state) => state.setSeverityFilters)
  const metrics = useComplaintMetrics()

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricTile
        label="Total Complaints"
        value={metrics.total}
        icon={ClipboardList}
        description="Citizen + infrastructure reports"
        onClick={() => {
          setSeverityFilters([])
          navigate(routes.dashboard)
        }}
      />
      <MetricTile
        label="Closed"
        value={metrics.closed}
        accentClassName="text-[var(--st-tertiary)]"
        icon={CheckCircle2}
        description={`${metrics.closedPercent}% of total`}
        onClick={() => {
          setSeverityFilters([])
          navigate(routes.dashboard)
        }}
      />
      <MetricTile
        label="In Progress"
        value={metrics.inProgress}
        accentClassName="text-[var(--st-secondary)]"
        icon={Clock}
        description={`${metrics.inProgressPercent}% of total`}
        onClick={() => {
          setSeverityFilters([])
          navigate(routes.dashboard)
        }}
      />
      <MetricTile
        label="Critical Open"
        value={metrics.critical}
        accentClassName="text-[var(--st-error)]"
        icon={AlertTriangle}
        description={`${metrics.pendingPercent}% pending`}
        onClick={() => {
          setSeverityFilters(['critical'])
          navigate(routes.dashboard)
        }}
      />
    </div>
  )
}
