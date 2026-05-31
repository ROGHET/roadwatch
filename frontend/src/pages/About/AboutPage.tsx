import { motion, useReducedMotion } from 'framer-motion'
import {
  Bot,
  Database,
  Globe,
  Layers,
  MapPin,
  Server,
  Users,
} from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { fadeInUp } from '../../lib/motion'

const teamLinks = [
  ['Harshit Rawat', 'https://www.linkedin.com/in/harshit-rawat-956850298/'],
  ['Kaushiki Choubey', 'https://www.linkedin.com/in/kaushiki-choubey/'],
  ['Vedanti Dokare', 'https://www.linkedin.com/in/vedanti-dokare-a3a67625a/'],
  ['Nikhil Nair', 'https://www.linkedin.com/in/nikhil-nair-225401333/'],
] as const

const techStack = [
  {
    title: 'Frontend',
    icon: Layers,
    items: ['React', 'TypeScript', 'Vite', 'Tailwind'],
  },
  {
    title: 'Backend',
    icon: Server,
    items: ['Node.js', 'Express', 'Prisma', 'PostgreSQL'],
  },
  {
    title: 'GIS',
    icon: MapPin,
    items: ['Leaflet', 'OpenStreetMap'],
  },
  {
    title: 'AI',
    icon: Bot,
    items: ['Gemini'],
  },
  {
    title: 'Data',
    icon: Database,
    items: ['NCRB', 'CRIF', 'BMC', 'Tamil Nadu Highways'],
  },
]

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()
  const { t } = useI18n()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 pb-28 pt-2 md:pb-12">
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-[var(--rw-border)] bg-[var(--rw-surface)] p-8 shadow-[var(--st-shadow-glass)] md:p-12"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <div className="relative">
          <h1 className="font-serif text-4xl font-normal leading-tight text-[var(--rw-text-primary)] md:text-5xl">
            {t('appName')}
          </h1>
          <p className="mt-3 text-xl font-light text-[var(--rw-text-secondary)]">
            {t('homeSubtitle')}
          </p>
          <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--rw-text-secondary)]">
            <p>
              <strong className="font-semibold text-[var(--rw-text-primary)]">{t('missionTitle')}</strong>{' '}
              {t('missionText')}
            </p>
            <p>
              <strong className="font-semibold text-[var(--rw-text-primary)]">{t('objectivesTitle')}</strong>{' '}
              {t('objectivesText')}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="flex flex-col gap-6"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <div>
          <p className="rw-type-label-caps text-[var(--rw-text-tertiary)]">Technology Stack</p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--rw-text-primary)]">Verified implementation</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {techStack.map(({ title, icon: Icon, items }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)]/80 p-5 backdrop-blur-xl"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[var(--rw-surface-muted)] text-[var(--st-primary)]">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-[var(--rw-text-primary)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--rw-text-secondary)]">
                {items.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="flex flex-col gap-6"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <div>
          <p className="rw-type-label-caps text-[var(--rw-text-tertiary)]">{t('builtBy')}</p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--rw-text-primary)]">The Team</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {teamLinks.map(([name, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--rw-text-primary)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--rw-border-strong)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            >
              <Users className="size-3.5 text-[var(--st-primary)]" />
              {name}
            </a>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-[var(--rw-text-tertiary)]">
          Metrics and impact numbers are intentionally omitted unless they are backed by connected datasets or database records.
        </p>
      </motion.section>

      <motion.section
        className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)]/80 p-5 backdrop-blur-xl"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <div className="flex items-start gap-3">
          <Globe className="mt-1 size-5 text-[var(--st-primary)]" />
          <div>
            <h2 className="font-semibold text-[var(--rw-text-primary)]">Real-data policy</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--rw-text-secondary)]">
              RoadWatch displays Data unavailable when a feature lacks verified source data.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
