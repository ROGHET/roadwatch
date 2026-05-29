import { AlertTriangle, LightbulbOff, Sparkles } from 'lucide-react'
import { mockComplaintSummaries } from '../../data/complaints'
import { GlassPanel, StitchSectionHeader } from '../stitch'

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
  const items = mockComplaintSummaries.slice(0, 3)

  return (
    <section className="flex flex-col gap-[var(--st-stack-sm)]">
      <StitchSectionHeader eyebrow="Recent Intelligence" title="" />
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const tone = toneBySeverity[item.severity ?? 'medium']
          const Icon = tone.Icon

          return (
            <GlassPanel
              key={item.id}
              className={`flex items-start gap-4 rounded-2xl border-l-4 p-4 ${tone.border}`}
            >
              <div className={`rounded-xl p-2 ${tone.iconWrap}`}>
                <Icon className={`size-5 ${tone.icon}`} aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[15px] font-semibold text-[var(--st-on-surface)]">
                  {item.title}
                </span>
                <span className="rw-type-metadata mt-1 text-[var(--st-on-surface-variant)]">
                  {item.roadName ?? 'Monitored corridor'} • {item.reportedAt}
                </span>
              </div>
            </GlassPanel>
          )
        })}
      </div>
    </section>
  )
}
