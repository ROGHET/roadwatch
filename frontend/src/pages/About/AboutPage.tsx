import { motion, useReducedMotion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StitchSectionHeader } from '../../components/stitch'
import { useI18n } from '../../lib/i18n'
import { fadeInUp } from '../../lib/motion'
import { routes } from '../../lib/routes'

const teamLinks = [
  ['Harshit Rawat', 'https://www.linkedin.com/in/harshit-rawat-956850298/'],
  ['Kaushiki Choubey', 'https://www.linkedin.com/in/kaushiki-choubey/'],
  ['Vedanti Dokare', 'https://www.linkedin.com/in/vedanti-dokare-a3a67625a/'],
  ['Nikhil Nair', 'https://www.linkedin.com/in/nikhil-nair-225401333/'],
] as const

function getCapabilities(t: (key: any) => string) {
  return [
    [t('monitorRoadQuality'), routes.dashboard],
    [t('reportRoadIssues'), routes.complaint],
    [t('budgetTransparency'), routes.dashboard],
    [t('contractorAccountability'), routes.dashboard],
    [t('complaintRouting'), routes.complaint],
    [t('repairHistory'), routes.road('mumbai-western-express')],
    [t('roadIntelligence'), routes.dashboard],
    [t('aiAssistance'), routes.assistant],
  ] as const
}

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <StitchSectionHeader
          eyebrow={t('about')}
          title={t('appName')}
          description={t('homeDescription')}
        />
        <div className="rw-glass-panel rw-glass-edge flex flex-col gap-4 rounded-2xl p-6 text-sm leading-relaxed text-[var(--st-on-surface-variant)] shadow-[var(--st-shadow-glass)]">
          <p>
            <strong className="text-[var(--st-on-surface)]">{t('missionTitle')}</strong> {t('missionText')}
          </p>
          <p>
            <strong className="text-[var(--st-on-surface)]">{t('objectivesTitle')}</strong> {t('objectivesText')}
          </p>
        </div>
      </motion.section>

      <motion.section
        className="flex flex-col gap-[var(--st-stack-sm)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <StitchSectionHeader title={t('coreCapabilities')} />
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {getCapabilities(t).map(([feature, href]) => (
            <li key={feature}>
              <button
                type="button"
                onClick={() => navigate(href)}
                className="rw-glass-panel flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm font-medium text-[var(--st-on-surface)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
              >
                <Info className="size-4 shrink-0 text-[var(--st-primary)]" />
                {feature}
              </button>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="flex flex-col gap-[var(--st-stack-sm)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <StitchSectionHeader title={t('builtBy')} />
        <div className="mt-2 flex flex-wrap gap-3">
          {teamLinks.map(([name, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rw-glass-panel rounded-full px-4 py-2 text-sm font-medium text-[var(--st-on-surface)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            >
              {name}
            </a>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
