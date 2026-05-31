import { X } from 'lucide-react'
import { useMemo } from 'react'
import { accidentRecords, crifBudgetRecords, tenderComplianceRecords } from '../../data/realDatasets'
import { useComplaintMetrics } from '../../hooks/useComplaintData'
import { computeCompositeHealth } from '../../lib/analytics/riskEngine'

export type InfrastructureHealthBreakdownProps = {
  open: boolean
  onClose: () => void
}

function percentFromRatio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 100)
}

export function InfrastructureHealthBreakdown({ open, onClose }: InfrastructureHealthBreakdownProps) {
  const complaintMetrics = useComplaintMetrics()

  const breakdown = useMemo(() => {
    const maharashtra = accidentRecords.find((row) =>
      row.stateOrCity.toLowerCase().includes('maharashtra'),
    )
    const health = computeCompositeHealth({
      state: maharashtra?.stateOrCity ?? 'Maharashtra',
      city: 'Mumbai',
    })

    const complaintResolution = complaintMetrics.closedPercent

    const budgetTotals = crifBudgetRecords.reduce(
      (acc, row) => {
        acc.sanctioned += row.sanctionedCrore
        acc.released += row.releasedCrore
        return acc
      },
      { sanctioned: 0, released: 0 },
    )
    const budgetUtilization = percentFromRatio(budgetTotals.released, budgetTotals.sanctioned)

    const tenderTotals = tenderComplianceRecords.reduce(
      (acc, row) => {
        acc.evaluated += row.tendersEvaluated
        acc.compliant += row.tendersEvaluated - row.nonCompliantTenders
        return acc
      },
      { evaluated: 0, compliant: 0 },
    )
    const safetyScore = percentFromRatio(tenderTotals.compliant, tenderTotals.evaluated)

    return {
      overall: health.score,
      roadQuality: health.score,
      safety: safetyScore,
      complaintResolution,
      budgetUtilization,
      factors: health.factors,
    }
  }, [complaintMetrics])

  if (!open) return null

  const rows = [
    { label: 'Road Quality', value: breakdown.roadQuality },
    { label: 'Safety', value: breakdown.safety },
    { label: 'Complaint Resolution', value: breakdown.complaintResolution },
    { label: 'Budget Utilization', value: breakdown.budgetUtilization },
  ]

  return (
    <div
      className="fixed inset-0 z-[600] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Infrastructure health breakdown"
    >
      <div className="rw-glass-panel rw-glass-edge max-h-[75vh] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--rw-text-tertiary)]">
              Infrastructure Health
            </p>
            <p className="font-serif text-3xl text-[var(--rw-text-primary)]">{breakdown.overall}%</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--rw-surface-muted)] text-[var(--rw-text-secondary)]"
            aria-label="Close breakdown"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-[var(--rw-text-secondary)]">{row.label}</span>
                <span className="font-medium text-[var(--rw-text-primary)]">{row.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--rw-surface-muted)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-[var(--rw-text-tertiary)]">
          Sources: ADSI, CRIF, Rajya Sabha tender data. Road quality uses composite engine (surface-quality
          dataset empty).
        </p>
      </div>
    </div>
  )
}
