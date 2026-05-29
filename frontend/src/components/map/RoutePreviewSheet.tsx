import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRightLeft, Clock3, Route, X } from 'lucide-react'
import { Button } from '../common/Button'
import { fadeInUp, springSnappy } from '../../lib/motion'
import type { RoutePreviewSnapshot } from '../../lib/map/providers/types'
import { useI18n } from '../../lib/i18n'

export type RoutePreviewSheetProps = {
  open: boolean
  loading: boolean
  route: RoutePreviewSnapshot | null
  destination: { lat: number; lng: number } | null
  destinationLabel: string
  onClose: () => void
  onOpenInGoogleMaps: () => void
}

export function RoutePreviewSheet({
  open,
  loading,
  route,
  destination,
  destinationLabel,
  onClose,
  onOpenInGoogleMaps,
}: RoutePreviewSheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const { t } = useI18n()
  const destinationText = destination
    ? `${destination.lat.toFixed(3)}, ${destination.lng.toFixed(3)}`
    : destinationLabel

  const handleCopyDestination = async () => {
    if (!destination || !navigator.clipboard?.writeText) return
    await navigator.clipboard.writeText(destinationText)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="absolute inset-x-0 bottom-0 z-[560] mx-auto mb-3 flex w-[min(28rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[color-mix(in_srgb,var(--rw-surface)_82%,transparent)] shadow-[0_24px_80px_-28px_rgb(0_0_0/0.55)] backdrop-blur-2xl sm:inset-x-auto sm:right-4 sm:top-24 sm:mb-0 sm:h-fit sm:max-h-[calc(100%-7rem)] sm:w-[24rem]"
          role="dialog"
          aria-modal="true"
          aria-label="Route preview"
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          exit={prefersReducedMotion ? undefined : 'hidden'}
          transition={prefersReducedMotion ? undefined : springSnappy}
          layout
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--rw-border)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--rw-text-tertiary)]">
                {t('routePreviewTitle')}
              </p>
              <h3 className="mt-1 truncate text-base font-semibold text-[var(--rw-text-primary)]">
                {destinationLabel}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
              aria-label="Close route preview"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                <p className="text-xs text-[var(--rw-text-tertiary)]">{t('destination')}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--rw-text-primary)]">
                  {destinationLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                <p className="text-xs text-[var(--rw-text-tertiary)]">{t('status')}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--rw-text-primary)]">
                  {loading ? t('calculatingRoute') : route ? t('readyToPreview') : t('waitingForRouteData')}
                </p>
              </div>
            </div>

            {route ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--rw-text-tertiary)]">
                    <Route className="size-3.5" aria-hidden="true" />
                    {t('distance')}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-[var(--rw-text-primary)]">
                    {route.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--rw-text-tertiary)]">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {t('eta')}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-[var(--rw-text-primary)]">
                    {route.travelTimeMinutes} min
                  </p>
                </div>
                <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                  <p className="text-xs text-[var(--rw-text-tertiary)]">{t('routeType')}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--rw-text-primary)]">
                    {route.source}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--rw-text-tertiary)]">
                <ArrowRightLeft className="size-3.5" aria-hidden="true" />
                {t('routeOverview')}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--rw-text-secondary)]">
                {loading
                  ? t('preparingRoutePreview')
                  : route?.overview ?? t('routeOverviewWillAppearHere')}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--rw-text-tertiary)]">
                <Route className="size-3.5" aria-hidden="true" />
                {t('routeInstructions')}
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[var(--rw-text-secondary)]">
                {route?.instructions?.length ? (
                  route.instructions.map((instruction, index) => (
                    <li key={`${instruction}-${index}`} className="flex gap-2">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--rw-surface)] text-[10px] font-semibold text-[var(--rw-text-primary)]">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--rw-text-tertiary)]">
                    {t('turnByTurnWillAppearHere')}
                  </li>
                )}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onOpenInGoogleMaps}>
                {t('openInGoogleMaps')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCopyDestination} disabled={!destination}>
                {t('copyCoordinates')}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t('closePreview')}
              </Button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
