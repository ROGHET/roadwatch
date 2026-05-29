import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { twMerge } from 'tailwind-merge'
import { homePageCopy } from '../../data/home'
import { fadeInUp, scaleIn, springSnappy } from '../../lib/motion'
import { useMapStore } from '../../stores/mapStore'
import { RoadWatchMap } from './RoadWatchMap'

export function MapExplorerSection() {
  const prefersReducedMotion = useReducedMotion()
  const titleId = useId()
  const isExpanded = useMapStore((state) => state.isExpanded)
  const setExpanded = useMapStore((state) => state.setExpanded)
  const consumeHomeRestore = useMapStore((state) => state.consumeHomeRestore)

  useEffect(() => {
    consumeHomeRestore()
  }, [consumeHomeRestore])

  useEffect(() => {
    if (!isExpanded) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded, setExpanded])

  return (
    <>
      <motion.section
        aria-labelledby={titleId}
        className="flex flex-col gap-3"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-tight text-[var(--rw-text-primary)]"
            >
              {homePageCopy.exploreTitle}
            </h2>
            <p className="text-sm text-[var(--rw-text-secondary)]">
              {homePageCopy.exploreDescription}
            </p>
          </div>
          <p className="text-xs text-[var(--rw-text-tertiary)] sm:text-right">
            Tap or click the map to explore in full screen
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={twMerge(
            'group relative w-full overflow-hidden rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)] text-left shadow-sm transition-[border-color,box-shadow] duration-200',
            'hover:border-[var(--rw-border-strong)] hover:shadow-md',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]',
          )}
          aria-label={`Open ${homePageCopy.mapTitle}. ${homePageCopy.mapDescription}`}
        >
          <div className="pointer-events-none h-52 touch-pan-y sm:h-64 lg:h-72">
            <RoadWatchMap key="map-preview" className="h-full w-full" mode="preview" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--rw-background)]/90 via-[var(--rw-background)]/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--rw-text-primary)]">
                {homePageCopy.mapTitle}
              </p>
              <p className="text-xs text-[var(--rw-text-secondary)]">
                {homePageCopy.mapDescription}
              </p>
            </div>
            <span className="rw-map-glass inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[var(--rw-text-primary)] shadow-md">
              <Maximize2 className="size-4" aria-hidden="true" />
              Explore map
            </span>
          </div>
        </button>
      </motion.section>

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            className="fixed inset-0 z-[400] flex flex-col bg-[var(--rw-background)]"
            role="dialog"
            aria-modal="true"
            aria-label={homePageCopy.mapTitle}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : springSnappy}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--rw-border)] bg-[var(--rw-background)]/90 px-4 py-3 backdrop-blur-md">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--rw-text-primary)]">
                  {homePageCopy.mapTitle}
                </p>
                <p className="text-xs text-[var(--rw-text-tertiary)]">
                  Roads and complaints across India
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => setExpanded(false)}
                className="rw-map-glass inline-flex size-10 items-center justify-center rounded-full shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                aria-label="Close map"
                variants={prefersReducedMotion ? undefined : scaleIn}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate={prefersReducedMotion ? undefined : 'visible'}
              >
                <X className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
              </motion.button>
            </div>

            <motion.div
              className="min-h-0 flex-1"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
              transition={prefersReducedMotion ? { duration: 0 } : springSnappy}
            >
              <RoadWatchMap key="map-expanded" className="h-full w-full" mode="expanded" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
