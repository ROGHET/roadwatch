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

const capabilities = [
  ['Monitor road quality', routes.dashboard],
  ['Report road issues', routes.complaint],
  ['Budget transparency', routes.dashboard],
  ['Contractor accountability', routes.dashboard],
  ['Complaint routing', routes.complaint],
  ['Repair history', routes.road('mumbai-western-express')],
  ['Road intelligence', routes.dashboard],
  ['AI assistance', routes.assistant],
] as const

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
          description="AI-powered road transparency platform."
        />
        <div className="rw-glass-panel rw-glass-edge flex flex-col gap-4 rounded-2xl p-6 text-sm leading-relaxed text-[var(--st-on-surface-variant)] shadow-[var(--st-shadow-glass)]">
          <p>
            <strong className="text-[var(--st-on-surface)]">Mission:</strong> To revolutionize road safety and transparency by empowering citizens with actionable intelligence, seamless reporting, and holding authorities accountable.
          </p>
          <p>
            <strong className="text-[var(--st-on-surface)]">Objectives:</strong> Enhance citizen engagement in public infrastructure, ensure clear visibility into budgets and contractor performance, and route complaints efficiently to the correct departments using AI.
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
        <StitchSectionHeader title="Core Capabilities" />
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {capabilities.map(([feature, href]) => (
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
        <StitchSectionHeader title="Built by" />
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
