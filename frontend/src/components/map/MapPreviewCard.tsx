import { motion, useReducedMotion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { homePageCopy } from '../../data/home'
import { fadeInUp } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { RoadWatchMap } from './RoadWatchMap'

export function MapPreviewCard() {
  const prefersReducedMotion = useReducedMotion()
  const titleId = useId()
  const navigate = useNavigate()

  return (
    <motion.section
      aria-labelledby={titleId}
      className="flex flex-col gap-3"
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
    >
      <h2 id={titleId} className="sr-only">
        {homePageCopy.mapTitle}
      </h2>

      <button
        type="button"
        onClick={() => navigate(routes.map)}
        className={twMerge(
          'group relative w-full overflow-hidden rounded-3xl text-left rw-glass-panel rw-glass-edge transition-transform duration-300',
          'hover:-translate-y-0.5',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]',
        )}
        aria-label={`Open ${homePageCopy.mapTitle}. ${homePageCopy.mapDescription}`}
      >
        <div className="pointer-events-none h-56 touch-pan-y sm:h-64">
          <RoadWatchMap key="map-preview" className="h-full w-full" mode="preview" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--rw-background)]/90 via-[var(--rw-background)]/20 to-transparent" />

        <div className="absolute inset-x-4 bottom-4 rw-glass-panel rw-glass-edge flex items-center justify-between gap-3 rounded-2xl p-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-[var(--st-tertiary)]" aria-hidden="true" />
            <span className="rw-type-metadata text-[var(--st-on-surface-variant)]">
              Tap to open full map experience
            </span>
          </div>
          <span className="rw-glass-button inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[var(--st-on-surface)]">
            <Maximize2 className="size-4" aria-hidden="true" />
            Open Map
          </span>
        </div>
      </button>
    </motion.section>
  )
}
