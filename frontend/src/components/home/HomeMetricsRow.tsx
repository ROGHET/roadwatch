import { AlertTriangle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { useMemo } from 'react'
import { mockComplaintRecords } from '../../data/complaints'
import { useComplaintStore } from '../../stores/complaintStore'
import { AnimatedCounter } from '../common/AnimatedCounter'
import { GlassPanel } from '../stitch'

type MetricTileProps = {
  label: string
  value: number
  suffix?: string
  accentClassName?: string
  icon: typeof ClipboardList
}

function MetricTile({ label, value, suffix = '', accentClassName, icon: Icon }: MetricTileProps) {
  return (
    <GlassPanel className="relative overflow-hidden rounded-2xl p-4">
      <Icon
        className="pointer-events-none absolute right-3 top-3 size-10 opacity-10"
        aria-hidden="true"
      />
      <p className="rw-type-label-caps text-[var(--st-on-surface-variant)]">{label}</p>
      <p className={`mt-1 font-serif text-3xl tabular-nums ${accentClassName ?? 'text-[var(--st-on-surface)]'}`}>
        <AnimatedCounter value={value} suffix={suffix} duration={1000} />
      </p>
    </GlassPanel>
  )
}

export function HomeMetricsRow() {
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)

  const metrics = useMemo(() => {
    const source =
      submittedComplaints.length > 0
        ? submittedComplaints.map((entry) => entry.marker)
        : mockComplaintRecords.map((record) => ({
            status: record.status,
            severity: record.severity,
          }))

    return {
      total: source.length,
      resolved: source.filter((entry) => entry.status === 'resolved').length,
      pending: source.filter((entry) =>
        ['pending', 'routed', 'in_review'].includes(entry.status),
      ).length,
      critical: source.filter(
        (entry) => entry.severity === 'critical' && entry.status !== 'resolved',
      ).length,
    }
  }, [submittedComplaints])

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricTile label="Total Complaints" value={metrics.total} icon={ClipboardList} />
      <MetricTile label="Resolved" value={metrics.resolved} accentClassName="text-[var(--st-tertiary)]" icon={CheckCircle2} />
      <MetricTile label="Pending" value={metrics.pending} accentClassName="text-[var(--st-secondary)]" icon={Clock} />
      <MetricTile
        label="Critical"
        value={metrics.critical}
        accentClassName="text-[var(--st-error)]"
        icon={AlertTriangle}
      />
    </div>
  )
}
