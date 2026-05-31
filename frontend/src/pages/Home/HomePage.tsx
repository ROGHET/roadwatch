import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeHealthCard } from '../../components/home/HomeHealthCard'
import { HomeMetricsRow } from '../../components/home/HomeMetricsRow'
import { HomeQuickActions } from '../../components/home/HomeQuickActions'
import { HomeRecentIntelligence } from '../../components/home/HomeRecentIntelligence'
import { MapPreviewCard } from '../../components/map/MapPreviewCard'
import { RtiGenerationModal } from '../../components/rti/RtiGenerationModal'
import { StitchSectionHeader } from '../../components/stitch'
import { useI18n } from '../../lib/i18n'
import { fadeInUp } from '../../lib/motion'
import { routes } from '../../lib/routes'

function getGreeting(t: (key: any) => string) {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return t('greetingMorning')
  if (hour >= 12 && hour < 17) return t('greetingAfternoon')
  if (hour >= 17 && hour < 22) return t('greetingEvening')
  return t('greetingNight')
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [rtiOpen, setRtiOpen] = useState(false)

  return (
    <div className="flex flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <h1 className="rw-type-display text-[var(--st-on-surface)]">{getGreeting(t)}</h1>
        <HomeHealthCard />
        <HomeMetricsRow />
      </motion.section>

      <motion.div
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <HomeQuickActions />
      </motion.div>

      <motion.section
        className="flex flex-col gap-[var(--st-stack-sm)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <StitchSectionHeader
          eyebrow={t('liveStatus')}
          title=""
          action={
            <button
              type="button"
              onClick={() => navigate(routes.map)}
              className="rw-type-label-caps text-[var(--st-primary)] transition-colors hover:text-[var(--st-primary-container)]"
            >
              {t('quickMap')}
            </button>
          }
        />
        <MapPreviewCard />
      </motion.section>

      <motion.div
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <HomeRecentIntelligence />
      </motion.div>

      <motion.section
        className="flex flex-col gap-[var(--st-stack-sm)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <StitchSectionHeader
          eyebrow={t('platform')}
          title={t('exploreCapabilities')}
          description={t('homeDescription')}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
          onClick={() => navigate(`${routes.dashboard}#budget-analytics`)}
            className="rw-glass-button rounded-full px-5 py-2.5 text-sm text-[var(--st-on-surface)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--st-shadow-fab)]"
          >
            {t('budgetAnalytics')}
          </button>
          <button
            type="button"
            onClick={() => navigate(routes.complaint)}
            className="rounded-full bg-[var(--rw-danger)] px-5 py-2.5 text-sm font-medium text-[var(--rw-danger-foreground)] shadow-[var(--st-shadow-fab)] transition-[filter,transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--rw-danger)_86%,black)] hover:shadow-[0_16px_36px_-14px_rgb(127_29_29/0.5)] active:scale-95"
          >
            {t('fileComplaint')}
          </button>
          <button
            type="button"
            onClick={() => setRtiOpen(true)}
            className="rw-glass-button rounded-full px-5 py-2.5 text-sm text-[var(--st-on-surface)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--st-shadow-fab)]"
          >
            RTI Generator
          </button>
          <button
            type="button"
            onClick={() => navigate(routes.assistant)}
            className="rw-glass-button rounded-full px-5 py-2.5 text-sm text-[var(--st-on-surface)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--st-shadow-fab)]"
          >
            {t('quickAI')}
          </button>
        </div>
      </motion.section>

      <RtiGenerationModal
        open={rtiOpen}
        onClose={() => setRtiOpen(false)}
        defaultAuthority="Data unavailable"
        defaultInformation="Certified copies of road work records, budget records, inspection reports, and action taken reports."
      />
    </div>
  )
}
