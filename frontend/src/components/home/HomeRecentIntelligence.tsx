import { AlertTriangle, LightbulbOff, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchComplaints } from '../../lib/api/complaints'
import { getRecentIntelligenceItems } from '../../lib/complaints/mergedComplaints'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../../stores/complaintStore'
import { GlassPanel, StitchSectionHeader } from '../stitch'
import { useI18n } from '../../lib/i18n'
import { routes } from '../../lib/routes'

const toneBySeverity = {
  critical: {
    border: 'border-l-[var(--st-error)]',
    iconWrap: 'bg-[var(--st-error)]/10',
    icon: 'text-[var(--st-error)]',
    Icon: AlertTriangle,
  },
  high: {
    border: 'border-l-[var(--st-error)]',
    iconWrap: 'bg-[var(--st-error)]/10',
    icon: 'text-[var(--st-error)]',
    Icon: AlertTriangle,
  },
  medium: {
    border: 'border-l-[var(--st-secondary)]',
    iconWrap: 'bg-[var(--st-secondary)]/10',
    icon: 'text-[var(--st-secondary)]',
    Icon: LightbulbOff,
  },
  low: {
    border: 'border-l-[var(--st-primary)]',
    iconWrap: 'bg-[var(--st-primary)]/10',
    icon: 'text-[var(--st-primary)]',
    Icon: Sparkles,
  },
} as const

export function HomeRecentIntelligence() {
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)
  const items = getRecentIntelligenceItems(submittedComplaints, 3)
  const { t } = useI18n()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function loadComplaints() {
      try {
        const complaints = await fetchComplaints()
        if (cancelled) return
        setSubmittedComplaints(complaints.map((complaint) => buildStoredSubmittedComplaint(complaint)))
      } catch {
        // Keep existing local/mock summaries if the API is unavailable.
      }
    }

    void loadComplaints()
    return () => {
      cancelled = true
    }
  }, [setSubmittedComplaints])

  return (
    <section className="flex flex-col gap-[var(--st-stack-sm)]">
      <StitchSectionHeader eyebrow={t('recentIntelligence')} title="" />
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const tone = toneBySeverity[item.severity ?? 'medium']
          const Icon = tone.Icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(routes.complaintDetail(item.id))}
              className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            >
              <GlassPanel className={`flex items-start gap-4 rounded-2xl border-l-4 p-4 ${tone.border}`}>
                <div className={`rounded-xl p-2 ${tone.iconWrap}`}>
                  <Icon className={`size-5 ${tone.icon}`} aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold text-[var(--st-on-surface)]">
                    {item.title}
                  </span>
                  <span className="rw-type-metadata mt-1 text-[var(--st-on-surface-variant)]">
                    {item.roadName ?? t('monitoredCorridor')} • {item.reportedAt}
                  </span>
                </div>
              </GlassPanel>
            </button>
          )
        })}
      </div>
    </section>
  )
}
