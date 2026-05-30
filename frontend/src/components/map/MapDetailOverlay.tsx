import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bot, Clock3, Cloud, Droplets, Route, TrafficCone, Wind, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { ComplaintSummaryCard } from '../complaints/ComplaintSummaryCard'
import { RoadStatusBadge } from '../road/RoadStatusBadge'
import { complaintsByRoadId } from '../../data/complaints'
import { getRoadBudget } from '../../data/mapRoadBudget'
import type { MapDisplayMode } from '../../lib/map/constants'
import { getRouteProvider } from '../../lib/map/providers/registry'
import type { MapActiveSelection } from '../../lib/map/types'
import { fadeInUp, springSnappy } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'
import { RoutePreviewSheet } from './RoutePreviewSheet'
import { useI18n } from '../../lib/i18n'

export type MapDetailOverlayProps = {
  mode: MapDisplayMode
  selection: MapActiveSelection | null
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onZoomToHere?: (lat: number, lng: number) => void
}

export function MapDetailOverlay({ mode, selection, userLocation, onClose, onZoomToHere }: MapDetailOverlayProps) {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const routeProvider = useMemo(() => getRouteProvider(), [])
  const routePreview = useMapStore((state) => state.routePreview)
  const routePreviewTarget = useMapStore((state) => state.routePreviewTarget)
  const routePreviewOpen = useMapStore((state) => state.routePreviewOpen)
  const setRoutePreview = useMapStore((state) => state.setRoutePreview)
  const setRoutePreviewTarget = useMapStore((state) => state.setRoutePreviewTarget)
  const setRoutePreviewOpen = useMapStore((state) => state.setRoutePreviewOpen)
  const clearRoutePreview = useMapStore((state) => state.clearRoutePreview)
  const persistForNavigation = useMapStore((state) => state.persistForNavigation)
  const [routeLoading, setRouteLoading] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    clearRoutePreview()
  }, [clearRoutePreview, selection])

  if (mode !== 'expanded' || !selection) {
    return null
  }

  const getRouteOrigin = () => {
    if (userLocation) {
      return userLocation
    }

    if (selection.kind === 'location') {
      return { lat: selection.lat, lng: selection.lng }
    }

    return null
  }

  const openRoutePreview = async (destination: { lat: number; lng: number }, destinationLabel: string) => {
    setRoutePreviewOpen(true)
    setRouteLoading(true)
    const origin = getRouteOrigin()
    const target = {
      destination,
      destinationLabel,
      ...(origin
        ? {
            origin,
            originLabel: userLocation ? t('currentUserLocation') : t('selectedMapLocation'),
          }
        : {}),
    }
    setRoutePreviewTarget(target)

    if (!origin) {
      setRoutePreview(null)
      setRouteLoading(false)
      return
    }

    try {
      const preview = await routeProvider.getRoutePreview({
        origin,
        destination,
        originLabel: target.originLabel ?? t('selectedMapLocation'),
        destinationLabel,
      })
      if (preview.path.length < 2 || preview.distanceKm <= 0 || preview.travelTimeMinutes <= 0 || preview.source === 'Unavailable') {
        setRoutePreview(null)
      } else {
        setRoutePreview(preview)
      }
    } catch {
      setRoutePreview(null)
    } finally {
      setRouteLoading(false)
    }
  }

  const handleMoreDetails = (roadId: string) => {
    persistForNavigation()
    navigate(routes.road(roadId))
  }

  const handleAskAI = () => {
    persistForNavigation()
    let aiState = {}
    if (selection?.kind === 'road') {
      aiState = { contextType: 'road', roadId: selection.road.id, roadName: selection.road.roadName, latitude: selection.road.lat, longitude: selection.road.lng }
    } else if (selection?.kind === 'complaint') {
      aiState = {
        contextType: 'complaint',
        complaintId: selection.complaint.id,
        roadId: selection.complaint.roadId,
        roadName: selection.complaint.roadName,
        latitude: selection.complaint.lat,
        longitude: selection.complaint.lng,
        severity: selection.complaint.severity,
        status: selection.complaint.status,
        resolutionStatus: selection.complaint.resolutionStatus,
        citizenReports: selection.complaint.citizenReports,
        maintenanceReports: selection.complaint.maintenanceReports,
      }
    } else if (selection?.kind === 'location') {
      aiState = { contextType: 'location', latitude: selection.lat, longitude: selection.lng }
    }
    navigate('/assistant', { state: aiState })
  }

  const handleZoomToHere = () => {
    if (selection?.kind === 'location' && onZoomToHere) {
      onZoomToHere(selection.lat, selection.lng)
    }
  }

  const handleOpenGoogleMaps = () => {
    const selectedDestination =
      selection.kind === 'road'
        ? { lat: selection.road.lat, lng: selection.road.lng }
        : selection.kind === 'complaint'
          ? { lat: selection.complaint.lat, lng: selection.complaint.lng }
          : { lat: selection.lat, lng: selection.lng }
    const destination = routePreview?.destination ?? routePreviewTarget?.destination ?? selectedDestination
    if (!destination) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <AnimatePresence>
        <motion.button
          type="button"
          className="absolute inset-0 z-[450] bg-[var(--rw-scrim)]/35 lg:hidden"
          aria-label="Close map details"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
        />

        <motion.div
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-[500] flex max-h-[85vh] flex-col lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-[min(26rem,calc(100vw-2rem))]"
          role="dialog"
          aria-modal="true"
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          exit={prefersReducedMotion ? undefined : 'hidden'}
          transition={prefersReducedMotion ? undefined : springSnappy}
        >
          <div className="rw-map-glass flex flex-col h-full overflow-hidden rounded-t-[1.5rem] shadow-[0_24px_80px_-28px_rgb(0_0_0/0.55)] lg:rounded-[1.5rem]">
              <div
                className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[var(--rw-border-strong)] lg:hidden"
                aria-hidden="true"
              />

              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--rw-border)] px-4 py-3 lg:px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                  {selection.kind === 'road'
                    ? t('roadSummary')
                    : selection.kind === 'complaint'
                      ? t('complaintRecord')
                      : t('locationIntelligenceTitle')}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                  aria-label="Close details"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 py-4 lg:px-5">
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
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('temperature')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.temperatureC} C
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <Cloud className="size-3.5" aria-hidden="true" />
                          {t('condition')}
                        </dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.condition}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('aqi')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.aqi}
                        </dd>
                        <dd className="text-xs text-[var(--rw-text-secondary)]">
                          {selection.intelligence.aqiLabel}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <Droplets className="size-3.5" aria-hidden="true" />
                          {t('humidity')}
                        </dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.humidityPercent}%
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('visibility')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.visibilityKm} km
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('rainProbability')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.rainProbabilityPercent}%
                        </dd>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <Wind className="size-3.5" aria-hidden="true" />
                          {t('windSpeed')}
                        </dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {selection.intelligence.windSpeedKph} km/h
                        </dd>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <TrafficCone className="size-3.5" aria-hidden="true" />
                          {t('traffic')}
                        </dt>
                        <dd className="mt-1 font-semibold capitalize text-[var(--rw-text-primary)]">
                          {selection.intelligence.trafficCondition}
                        </dd>
                        <dd className="mt-1 text-xs leading-5 text-[var(--rw-text-secondary)]">
                          {selection.intelligence.trafficDescription}
                        </dd>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {t('dataTimestamp')}
                        </dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {new Date(selection.intelligence.observedAt).toLocaleString()}
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
                        <dt className="text-[var(--rw-text-secondary)]">{t('budgetSanctioned')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {getRoadBudget(selection.road.id).sanctioned === 'Not published' ? t('notPublished') : getRoadBudget(selection.road.id).sanctioned}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('budgetSpent')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {getRoadBudget(selection.road.id).spent === 'Not published' ? t('notPublished') : getRoadBudget(selection.road.id).spent}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('filterComplaints')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {(complaintsByRoadId[selection.road.id] ?? []).length}
                        </dd>
                      </div>
                      {selection.road.contractor ? (
                        <div className="flex flex-col gap-1 py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('contractor')}</dt>
                          <dd className="font-medium text-[var(--rw-text-primary)]">
                            {selection.road.contractor}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
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
                    updatedAt={selection.complaint.updatedAt}
                    resolutionStatus={selection.complaint.resolutionStatus}
                    citizenReports={selection.complaint.citizenReports}
                    maintenanceReports={selection.complaint.maintenanceReports}
                  />
                ) : null}
              </div>

              {/* Fixed Footer for Buttons */}
              <div className="shrink-0 border-t border-[var(--rw-border)] bg-[var(--rw-surface-muted)]/80 p-4">
                {selection.kind === 'location' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        openRoutePreview(
                          { lat: selection.lat, lng: selection.lng },
                          selection.intelligence.locationName,
                        )
                      }
                    >
                      <Route className="size-4 mr-2" aria-hidden="true" />
                      {t('previewRoute')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(routes.complaint)}>
                      Report Issue
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      Ask AI About This Location
                    </Button>
                    <Button type="button" variant="outline" onClick={handleZoomToHere}>
                      Zoom To Here
                    </Button>
                  </div>
                )}

                {selection.kind === 'road' && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => handleMoreDetails(selection.road.id)}>
                      {t('moreDetails')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(routes.complaint)}>
                      File Complaint
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      Ask AI About This Road
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openRoutePreview(
                          { lat: selection.road.lat, lng: selection.road.lng },
                          selection.road.roadName,
                        )
                      }
                    >
                      <Route className="size-4 mr-2" aria-hidden="true" />
                      Preview Route
                    </Button>
                  </div>
                )}

                {selection.kind === 'complaint' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        persistForNavigation()
                        navigate(routes.complaintDetail(selection.complaint.id))
                      }}
                    >
                      View Complaint
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openRoutePreview(
                          { lat: selection.complaint.lat, lng: selection.complaint.lng },
                          selection.complaint.roadName ?? selection.complaint.title,
                        )
                      }
                    >
                      <Route className="size-4 mr-2" aria-hidden="true" />
                      {t('previewRoute')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      Ask AI About This Complaint
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        persistForNavigation()
                        navigate(routes.complaint, {
                          state: {
                            prefill: {
                              roadId: selection.complaint.roadId,
                              lat: selection.complaint.lat,
                              lng: selection.complaint.lng,
                              title: selection.complaint.title,
                            }
                          }
                        })
                      }}
                    >
                      File similar issue
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
        </motion.div>
      </AnimatePresence>

      <RoutePreviewSheet
        open={routePreviewOpen}
        loading={routeLoading}
        route={routePreview}
        origin={routePreview?.origin ?? routePreviewTarget?.origin ?? null}
        destination={routePreview?.destination ?? routePreviewTarget?.destination ?? null}
        destinationLabel={routePreview?.destinationLabel ?? routePreviewTarget?.destinationLabel ?? 'Selected destination'}
        onClose={clearRoutePreview}
        onOpenInGoogleMaps={handleOpenGoogleMaps}
      />
    </>
  )
}
