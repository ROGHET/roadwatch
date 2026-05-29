import { twMerge } from 'tailwind-merge'

export type AnimatedMarkerBadgeProps = {
  tone?: 'primary' | 'secondary' | 'tertiary' | 'error'
  className?: string
}

const toneStyles = {
  primary: {
    ring: 'border-[var(--st-primary-container)] bg-[var(--st-primary-container)]/20',
    pulse: 'bg-[var(--st-primary-container)]/40',
  },
  secondary: {
    ring: 'border-[var(--st-secondary-container)] bg-[var(--st-secondary-container)]/20',
    pulse: 'bg-[var(--st-secondary-container)]/40',
  },
  tertiary: {
    ring: 'border-[var(--st-tertiary)] bg-[var(--st-tertiary)]/20',
    pulse: 'bg-[var(--st-tertiary)]/40',
  },
  error: {
    ring: 'border-[var(--st-error)] bg-[var(--st-error)]/20',
    pulse: 'bg-[var(--st-error)]/40',
  },
} as const

export function AnimatedMarkerBadge({ tone = 'primary', className }: AnimatedMarkerBadgeProps) {
  const styles = toneStyles[tone]

  return (
    <div className={twMerge('relative size-4', className)}>
      <div
        className={twMerge('absolute inset-0 rounded-full rw-marker-pulse', styles.pulse)}
        aria-hidden="true"
      />
      <div
        className={twMerge(
          'relative z-10 size-4 rounded-full border-2 border-white',
          styles.ring,
        )}
      />
    </div>
  )
}
