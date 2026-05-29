import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HomeHealthCard } from '../../components/home/HomeHealthCard'
import { HomeQuickActions } from '../../components/home/HomeQuickActions'
import { HomeRecentIntelligence } from '../../components/home/HomeRecentIntelligence'
import { MapPreviewCard } from '../../components/map/MapPreviewCard'
import { StitchSectionHeader } from '../../components/stitch'
import { useI18n } from '../../lib/i18n'
import { fadeInUp } from '../../lib/motion'
import { routes } from '../../lib/routes'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning, Citizen.'
  if (hour >= 12 && hour < 17) return 'Good afternoon, Citizen.'
  if (hour >= 17 && hour < 22) return 'Good evening, Citizen.'
  return 'Welcome back, Citizen.'
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <h1 className="rw-type-display text-[var(--st-on-surface)]">{getGreeting()}</h1>
        <HomeHealthCard />
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
          eyebrow="Live Status • India"
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
        className="hidden md:block"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <StitchSectionHeader
          eyebrow="Platform"
          title="Explore capabilities"
          description={t('homeDescription')}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(routes.dashboard)}
            className="rw-glass-button rounded-full px-5 py-2.5 text-sm text-[var(--st-on-surface)]"
          >
            Budget & Analytics
          </button>
          <button
            type="button"
            onClick={() => navigate(routes.complaint)}
            className="rounded-full bg-[var(--rw-danger)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--st-shadow-fab)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-95"
          >
            {t('fileComplaint')}
          </button>
        </div>
      </motion.section>
    </div>
  )
}
