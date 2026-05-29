import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { PageContainer } from '../common/PageContainer'

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
  return (
    <section
      className={twMerge(
        'rounded-lg border border-slate-200 bg-slate-50 px-6 py-10 dark:border-slate-800 dark:bg-slate-900/50 sm:px-10 sm:py-12',
        className,
      )}
      aria-labelledby="hero-title"
    >
      <PageContainer className="gap-4">
        {subtitle ? (
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
        <h1
          id="hero-title"
          className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50"
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>
        ) : null}
      </PageContainer>
    </section>
  )
}
