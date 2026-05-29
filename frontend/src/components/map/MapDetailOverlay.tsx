import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Cloud,
  Droplets,
  ExternalLink,
  Navigation,
  Wind,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { ComplaintSummaryCard } from '../complaints/ComplaintSummaryCard'
import { RoadStatusBadge } from '../road/RoadStatusBadge'
import { complaintsByRoadId } from '../../data/complaints'
import { getRoadBudget } from '../../data/mapRoadBudget'
import type { MapDisplayMode } from '../../lib/map/constants'
import type { MapActiveSelection } from '../../lib/map/types'
import { fadeInUp, springSnappy } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'

export type MapDetailOverlayProps = {
  mode: MapDisplayMode
  selection: MapActiveSelection | null
  onClose: () => void
}

function externalMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function MapDetailOverlay({ mode, selection, onClose }: MapDetailOverlayProps) {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const persistForNavigation = useMapStore((state) => state.persistForNavigation)

  if (mode !== 'expanded' || !selection) {
    return null
  }

  const handleMoreDetails = (roadId: string) => {
    persistForNavigation()
    navigate(routes.road(roadId))
  }

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        className="absolute inset-0 z-[450] bg-[var(--rw-scrim)]/40 lg:hidden"
        aria-label="Close map details"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
      />

      <motion.aside
        className="absolute inset-x-0 bottom-0 z-[500] flex max-h-[min(75dvh,32rem)] flex-col lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-24 lg:max-h-[calc(100%-7rem)] lg:w-full lg:max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Map details"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        exit={prefersReducedMotion ? undefined : 'hidden'}
        transition={prefersReducedMotion ? undefined : springSnappy}
      >
        <div className="rw-map-glass flex flex-col rounded-t-3xl shadow-2xl lg:rounded-2xl">
          <div
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--rw-border-strong)] lg:hidden"
            aria-hidden="true"
          />

          <div className="flex items-start justify-between gap-3 border-b border-[var(--rw-border)] px-4 py-3 lg:px-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
              {selection.kind === 'road'
                ? 'Road summary'
                : selection.kind === 'complaint'
                  ? 'Complaint record'
                  : 'Location intelligence'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-colors hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
              aria-label="Close details"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-4 lg:px-5">
            {selection.kind === 'location' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">
                    {selection.intelligence.locationName}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--rw-text-tertiary)]">
                    Tap any point on the map for environmental context
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                    <dt className="text-xs text-[var(--rw-text-tertiary)]">Temperature</dt>
                    <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                      {selection.intelligence.temperatureC} C
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                    <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                      <Cloud className="size-3.5" aria-hidden="true" />
                      Condition
                    </dt>
                    <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                      {selection.intelligence.condition}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                    <dt className="text-xs text-[var(--rw-text-tertiary)]">AQI</dt>
                    <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                      {selection.intelligence.aqi}
                    </dd>
                    <dd className="text-xs text-[var(--rw-text-secondary)]">
                      {selection.intelligence.aqiLabel}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                    <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                      <Droplets className="size-3.5" aria-hidden="true" />
                      Humidity
                    </dt>
                    <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                      {selection.intelligence.humidityPercent}%
                    </dd>
                  </div>
                  <div className="col-span-2 rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                    <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                      <Wind className="size-3.5" aria-hidden="true" />
                      Wind speed
                    </dt>
                    <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                      {selection.intelligence.windSpeedKph} km/h
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {selection.kind === 'road' ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">
                      {selection.road.roadName}
                    </h3>
                    {selection.road.roadType ? (
                      <p className="mt-1 text-sm text-[var(--rw-text-secondary)]">
                        {selection.road.roadType}
                      </p>
                    ) : null}
                  </div>
                  <RoadStatusBadge status={selection.road.status} />
                </div>

                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                    <dt className="text-[var(--rw-text-secondary)]">Budget sanctioned</dt>
                    <dd className="font-medium text-[var(--rw-text-primary)]">
                      {getRoadBudget(selection.road.id).sanctioned}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                    <dt className="text-[var(--rw-text-secondary)]">Budget spent</dt>
                    <dd className="font-medium text-[var(--rw-text-primary)]">
                      {getRoadBudget(selection.road.id).spent}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                    <dt className="text-[var(--rw-text-secondary)]">Complaints</dt>
                    <dd className="font-medium text-[var(--rw-text-primary)]">
                      {(complaintsByRoadId[selection.road.id] ?? []).length}
                    </dd>
                  </div>
                  {selection.road.contractor ? (
                    <div className="flex flex-col gap-1 py-2">
                      <dt className="text-[var(--rw-text-secondary)]">Contractor</dt>
                      <dd className="font-medium text-[var(--rw-text-primary)]">
                        {selection.road.contractor}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => handleMoreDetails(selection.road.id)}>
                    More Details
                  </Button>
                  <a
                    href={externalMapsUrl(selection.road.lat, selection.road.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--rw-border)] bg-transparent px-4 text-sm font-medium text-[var(--rw-text-primary)] transition-colors hover:border-[var(--rw-border-strong)] hover:bg-[var(--rw-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                  >
                    <Navigation className="size-4" aria-hidden="true" />
                    Navigate
                    <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : null}

            {selection.kind === 'complaint' ? (
              <ComplaintSummaryCard
                title={selection.complaint.title}
                referenceId={selection.complaint.referenceId}
                roadName={selection.complaint.roadName}
                status={selection.complaint.status}
                severity={selection.complaint.severity}
                reportedAt={selection.complaint.reportedAt}
                footer={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(routes.complaint)}
                    >
                      File similar issue
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                }
              />
            ) : null}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
