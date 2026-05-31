import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bot, Clock3, Cloud, Droplets, Route, TrafficCone, Wind } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { ComplaintSummaryCard } from '../complaints/ComplaintSummaryCard'
import { RoadStatusBadge } from '../road/RoadStatusBadge'
import { complaintsByRoadId } from '../../data/complaints'
import { findContractsForRoadLabel } from '../../data/contractAwards'
import { getRoadBudget } from '../../data/mapRoadBudget'
import { RoadScoreBadge } from '../road/RoadScoreBadge'
import { RiskIndicator } from '../road/RiskIndicator'
import type { MapDisplayMode } from '../../lib/map/constants'
import { getRouteProvider } from '../../lib/map/providers/registry'
import type { MapActiveSelection } from '../../lib/map/types'
import { fadeInUp, springSnappy } from '../../lib/motion'
import { inferPlaceFromCoordinates } from '../../lib/map/inferPlace'
import { routes } from '../../lib/routes'
import { useComplaintStore } from '../../stores/complaintStore'
import { useMapStore } from '../../stores/mapStore'
import { RoutePreviewSheet } from './RoutePreviewSheet'
import { MapSidePanel } from './MapSidePanel'
import { useI18n } from '../../lib/i18n'

export type MapDetailOverlayProps = {
  mode: MapDisplayMode
  selection: MapActiveSelection | null
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onZoomToHere?: (lat: number, lng: number) => void
}

function valueWithUnit(value: number | string, unit: string) {
  return typeof value === 'number' ? `${value} ${unit}` : value
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
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const complaintPickMode = useComplaintStore((state) => state.complaintPickMode)
  const locationPickPending = useComplaintStore((state) => state.locationPickPending)
  const completeLocationPick = useComplaintStore((state) => state.completeLocationPick)
  const [routeLoading, setRouteLoading] = useState(false)
  const [activePanelTab, setActivePanelTab] = useState<'intelligence' | 'contractor'>('intelligence')
  const { t } = useI18n()

  useEffect(() => {
    clearRoutePreview()
    setActivePanelTab('intelligence')
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
      const submitted = submittedComplaints.find(
        (entry) => entry.marker.id === selection.complaint.id,
      )
      aiState = {
        contextType: 'complaint',
        complaintId: selection.complaint.id,
        referenceId: selection.complaint.referenceId,
        issueType: selection.complaint.issueType,
        description: submitted?.description ?? selection.complaint.title,
        latitude: selection.complaint.lat,
        longitude: selection.complaint.lng,
        location: selection.complaint.roadName ?? selection.complaint.title,
        authority: selection.complaint.assignedAuthority,
        roadId: selection.complaint.roadId,
        roadName: selection.complaint.roadName,
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

  const handleSelectLocationForComplaint = () => {
    if (selection?.kind !== 'location' || !complaintPickMode) return

    const place = inferPlaceFromCoordinates(selection.lat, selection.lng)
    completeLocationPick(
      selection.lat,
      selection.lng,
      selection.intelligence.locationName,
      selection.intelligence.city || place.city,
      selection.intelligence.state || place.state,
    )
    onClose()
    navigate(routes.complaint)
  }

  const handleOpenGoogleMaps = () => {
    const selectedDestination =
      selection.kind === 'road'
        ? { lat: selection.road.lat, lng: selection.road.lng }
        : selection.kind === 'complaint'
          ? { lat: selection.complaint.lat, lng: selection.complaint.lng }
          : selection.kind === 'toll'
            ? { lat: selection.toll.lat, lng: selection.toll.lng }
            : { lat: selection.lat, lng: selection.lng }
    const destination = routePreview?.destination ?? routePreviewTarget?.destination ?? selectedDestination
    if (!destination) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <AnimatePresence mode="sync">
        <motion.button
          key="map-detail-backdrop"
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
          key="map-detail-panel"
          className="contents"
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          exit={prefersReducedMotion ? undefined : 'hidden'}
          transition={prefersReducedMotion ? undefined : springSnappy}
        >
          <MapSidePanel
            title={
              selection.kind === 'road'
                ? t('roadSummary')
                : selection.kind === 'complaint'
                  ? t('complaintRecord')
                  : selection.kind === 'toll'
                    ? t('tollPlaza')
                    : t('locationIntelligenceTitle')
            }
            onClose={onClose}
            closeLabel={t('closeDetails')}
            headerExtra={
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePanelTab('intelligence')}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activePanelTab === 'intelligence'
                      ? 'bg-[var(--rw-primary)] text-white'
                      : 'bg-[var(--rw-surface-muted)] text-[var(--rw-text-secondary)]'
                  }`}
                >
                  {t('intelligenceTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanelTab('contractor')}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activePanelTab === 'contractor'
                      ? 'bg-[var(--rw-primary)] text-white'
                      : 'bg-[var(--rw-surface-muted)] text-[var(--rw-text-secondary)]'
                  }`}
                >
                  {t('contractorTab')}
                </button>
              </div>
            }
            footer={
              <>
                {selection.kind === 'location' && (
                  <div className="flex flex-col gap-2">
                    {complaintPickMode && locationPickPending ? (
                      <Button type="button" onClick={handleSelectLocationForComplaint}>
                        {t('selectLocationForComplaint')}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
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
                      {t('reportIssue')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      {t('askAIAboutLocation')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleZoomToHere}>
                      {t('zoomToHere')}
                    </Button>
                  </div>
                )}

                {selection.kind === 'road' && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => handleMoreDetails(selection.road.id)}>
                      {t('moreDetails')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(routes.complaint)}>
                      {t('fileComplaint')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      {t('askAIAboutRoad')}
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
                      {t('previewRoute')}
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
                      {t('viewComplaint')}
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
                      {t('askAIAboutComplaint')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const place = inferPlaceFromCoordinates(
                          selection.complaint.lat,
                          selection.complaint.lng,
                        )
                        persistForNavigation()
                        navigate(routes.complaint, {
                          state: {
                            prefill: {
                              roadId: selection.complaint.roadId,
                              roadName: selection.complaint.roadName,
                              lat: selection.complaint.lat,
                              lng: selection.complaint.lng,
                              issueType: selection.complaint.issueType,
                              title: selection.complaint.title,
                              locationLabel:
                                selection.complaint.roadName ?? selection.complaint.title,
                              city: place.city,
                              state: place.state,
                            },
                          },
                        })
                      }}
                    >
                      {t('fileSimilarIssue')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>
                      {t('closeDetails')}
                    </Button>
                  </div>
                )}
              </>
            }
          >
                {activePanelTab === 'contractor' ? (
                  <ContractorPanel selection={selection} />
                ) : (
                  <>
                {selection.kind === 'location' ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">
                        {selection.intelligence.locationName}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--rw-text-tertiary)]">
                        {t('tapMapHint')}
                      </p>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('temperature')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {valueWithUnit(selection.intelligence.temperatureC, 'C')}
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
                          {valueWithUnit(selection.intelligence.humidityPercent, '%')}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('visibility')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {valueWithUnit(selection.intelligence.visibilityKm, 'km')}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('rainProbability')}</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {valueWithUnit(selection.intelligence.rainProbabilityPercent, '%')}
                        </dd>
                      </div>
                      {selection.weatherIntel ? (
                        <>
                          <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                            <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('rainfall')}</dt>
                            <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                              {valueWithUnit(selection.weatherIntel.rainfallMm, 'mm')}
                            </dd>
                          </div>
                          <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                            <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('floodRisk')}</dt>
                            <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                              {selection.weatherIntel.floodRisk}%
                            </dd>
                          </div>
                          {selection.weatherIntel.warnings.length > 0 ? (
                            <div className="col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                              <dt className="text-xs font-medium text-amber-200">{t('weatherWarnings')}</dt>
                              <dd className="mt-2 space-y-1 text-[var(--rw-text-primary)]">
                                {selection.weatherIntel.warnings.map((warning) => (
                                  <p key={warning}>{warning}</p>
                                ))}
                              </dd>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {selection.intelligence.roadType ? (
                        <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                          <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                            <TrafficCone className="size-3.5" aria-hidden="true" />
                            {t('roadTypeLabel')}
                          </dt>
                          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                            {selection.intelligence.roadType}
                          </dd>
                        </div>
                      ) : null}
                      <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
                          <Wind className="size-3.5" aria-hidden="true" />
                          {t('windSpeed')}
                        </dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          {valueWithUnit(selection.intelligence.windSpeedKph, 'km/h')}
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
                      <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-xs text-[var(--rw-text-tertiary)]">Contractor Information</dt>
                        <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
                          Contractor information unavailable
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
                      <div className="flex flex-col items-end gap-2">
                        <RoadStatusBadge status={selection.road.status} />
                        <RoadScoreBadge score={selection.road.score} tier={selection.road.scoreTier} />
                        <RiskIndicator level={selection.road.riskLevel} />
                      </div>
                    </div>

                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('budgetSanctioned')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {getRoadBudget(selection.road.id).sanctioned}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('budgetSpent')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {getRoadBudget(selection.road.id).spent}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('lastRepairDate')}</dt>
                        <dd className="font-medium text-[var(--rw-text-primary)]">
                          {'lastRepairDate' in selection.road && selection.road.lastRepairDate
                            ? selection.road.lastRepairDate
                            : t('notPublished')}
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
                      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
                        <dt className="text-[var(--rw-text-secondary)]">Contractor Information</dt>
                        <dd className="mt-1 font-medium text-[var(--rw-text-primary)]">
                          Contractor information unavailable
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}

                {selection.kind === 'toll' ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">{selection.toll.name}</h3>
                    <dl className="grid gap-2">
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">NH</dt>
                        <dd className="font-medium">{selection.toll.nhNumber ?? t('unknown')}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('emergencyCrane')}</dt>
                        <dd className="font-medium">{selection.toll.helplineCrane ?? t('notPublished')}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('emergencyAmbulance')}</dt>
                        <dd className="font-medium">{selection.toll.helplineAmbulance ?? t('notPublished')}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('patrolContact')}</dt>
                        <dd className="font-medium">{selection.toll.helplinePatrol ?? t('notPublished')}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('policeContact')}</dt>
                        <dd className="font-medium">
                          {selection.toll.policeStationContact ?? selection.toll.nearestPoliceStation ?? t('notPublished')}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('nearestHospital')}</dt>
                        <dd className="font-medium">{selection.toll.nearestHospitals ?? t('notPublished')}</dd>
                      </div>
                      <div className="flex justify-between gap-4 py-2">
                        <dt className="text-[var(--rw-text-secondary)]">{t('highwayService')}</dt>
                        <dd className="font-medium">{selection.toll.emergencyServices ?? t('notPublished')}</dd>
                      </div>
                    </dl>
                  </div>
                ) : null}

                {selection.kind === 'complaint' ? (
                  <ComplaintSummaryCard
                    title={selection.complaint.title}
                    referenceId={selection.complaint.referenceId}
                    roadName={selection.complaint.roadName}
                    roadType={selection.complaint.roadType}
                    issueType={selection.complaint.issueType}
                    assignedAuthority={selection.complaint.assignedAuthority}
                    assignedDepartment={selection.complaint.assignedDepartment}
                    status={selection.complaint.status}
                    severity={selection.complaint.severity}
                    reportedAt={selection.complaint.reportedAt}
                    updatedAt={selection.complaint.updatedAt}
                    resolutionStatus={selection.complaint.resolutionStatus}
                    citizenReports={selection.complaint.citizenReports}
                    maintenanceReports={selection.complaint.maintenanceReports}
                  />
                ) : null}
                  </>
                )}
          </MapSidePanel>
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

function ContractorPanel({ selection }: { selection: MapActiveSelection }) {
  const { t } = useI18n()
  const roadLabel =
    selection.kind === 'road'
      ? selection.road.roadName
      : selection.kind === 'complaint'
        ? selection.complaint.roadName ?? selection.complaint.title
        : ''
  const matches = roadLabel ? findContractsForRoadLabel(roadLabel) : []

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm text-[var(--rw-text-secondary)]">
        {t('noRoadContractMapping')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm"
        >
          <p className="font-semibold text-[var(--rw-text-primary)]">{row.supplier}</p>
          <dl className="mt-2 grid gap-1">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--rw-text-secondary)]">{t('projectName')}</dt>
              <dd className="text-right font-medium">{row.project}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--rw-text-secondary)]">{t('awardValue')}</dt>
              <dd className="text-right font-medium tabular-nums">
                ${row.awardValueUsd.toLocaleString('en-IN')}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--rw-text-secondary)]">{t('procurementMethod')}</dt>
              <dd className="text-right font-medium">{row.procurementMethod}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  )
}
