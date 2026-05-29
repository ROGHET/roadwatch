import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw, X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { homePageCopy } from '../../data/home'
import { scaleIn, springSnappy } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'
import { RoadWatchMap } from './RoadWatchMap'

export type MapFullScreenExperienceProps = {
  onClose?: () => void
}

export function MapFullScreenExperience({ onClose }: MapFullScreenExperienceProps) {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const mapSessionId = useMapStore((state) => state.mapSessionId)
  const resetMapForFreshOpen = useMapStore((state) => state.resetMapForFreshOpen)
  const leaveMapExplorer = useMapStore((state) => state.leaveMapExplorer)
  const setExpanded = useMapStore((state) => state.setExpanded)

  useEffect(() => {
    setExpanded(true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      setExpanded(false)
      leaveMapExplorer()
    }
  }, [leaveMapExplorer, setExpanded])

  const handleClose = () => {
    if (onClose) {
      onClose()
      return
    }
    navigate(routes.home)
  }

  return (
    <div className="fixed inset-0 z-[400] flex flex-col bg-[var(--rw-background)]">
      <div className="flex items-center justify-between gap-3 rw-glass-nav border-b border-[var(--st-outline-white)] px-4 py-3 pt-[calc(var(--st-floating-offset)+3.5rem)] sm:pt-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-[var(--st-primary)]">{homePageCopy.mapTitle}</p>
          <p className="rw-type-metadata text-[var(--st-on-surface-variant)]">
            Roads and complaints across India
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            onClick={resetMapForFreshOpen}
            className="rw-map-glass inline-flex size-10 items-center justify-center rounded-full shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label="Reset map"
            title="Reset map"
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <RotateCcw className="size-4 text-[var(--rw-text-primary)]" aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleClose}
            className="rw-map-glass inline-flex size-10 items-center justify-center rounded-full shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label="Close map"
            title="Close map"
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <X className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      <motion.div
        className="min-h-0 flex-1"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : springSnappy}
      >
        <RoadWatchMap key={`map-expanded-${mapSessionId}`} className="h-full w-full" mode="expanded" />
      </motion.div>
    </div>
  )
}
