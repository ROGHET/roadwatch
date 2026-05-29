import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { PageContainer } from '../common/PageContainer'
import { staggerContainer, staggerItem, transitions } from '../../lib/motion'

export type HeroSectionProps = {
  title: string
  subtitle?: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  actions,
  className,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className={twMerge(
        'relative overflow-hidden rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)] px-6 py-10 shadow-[0_12px_24px_-8px_rgb(0_0_0_0.22)] sm:px-10 sm:py-12',
        className,
      )}
      aria-labelledby="hero-title"
      variants={prefersReducedMotion ? undefined : staggerContainer}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(37_99_235_/_0.08),transparent_55%)]"
        aria-hidden="true"
      />
      <PageContainer className="relative gap-4">
        {subtitle ? (
          <motion.p
            variants={prefersReducedMotion ? undefined : staggerItem}
            className="text-sm font-medium uppercase tracking-wider text-[var(--rw-text-tertiary)]"
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.h1
          id="hero-title"
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="text-3xl font-bold tracking-tight text-[var(--rw-text-primary)] sm:text-4xl"
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            variants={prefersReducedMotion ? undefined : staggerItem}
            className="max-w-2xl text-base leading-relaxed text-[var(--rw-text-secondary)] sm:text-lg"
          >
            {description}
          </motion.p>
        ) : null}
        {actions ? (
          <motion.div
            variants={prefersReducedMotion ? undefined : staggerItem}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {actions}
          </motion.div>
        ) : null}
      </PageContainer>
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-[var(--rw-border)]"
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        animate={prefersReducedMotion ? undefined : { scaleX: 1 }}
        transition={transitions.moderate}
        style={{ originX: 0 }}
        aria-hidden="true"
      />
    </motion.section>
  )
}
