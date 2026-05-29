import { twMerge } from 'tailwind-merge'

export type StatPillProps = {
  label: string
  value: string
  tone?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral'
  className?: string
}

const toneClasses = {
  primary: 'border-[var(--st-primary)]/30 bg-[var(--st-primary)]/10 text-[var(--st-primary)]',
  secondary: 'border-[var(--st-secondary)]/30 bg-[var(--st-secondary)]/10 text-[var(--st-secondary)]',
  tertiary: 'border-[var(--st-tertiary)]/30 bg-[var(--st-tertiary)]/10 text-[var(--st-tertiary)]',
  error: 'border-[var(--st-error)]/30 bg-[var(--st-error)]/10 text-[var(--st-error)]',
  neutral: 'border-[var(--st-outline-white)] bg-white/5 text-[var(--st-on-surface-variant)]',
} as const

export function StatPill({ label, value, tone = 'neutral', className }: StatPillProps) {
  return (
    <div
      className={twMerge(
        'inline-flex flex-col gap-1 rounded-xl border px-3 py-2',
        toneClasses[tone],
        className,
      )}
    >
      <span className="rw-type-label-caps opacity-80">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
