import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bot, Cloud, Route, TrafficCone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { ComplaintSummaryCard } from '../complaints/ComplaintSummaryCard'
import { RoadStatusBadge } from '../road/RoadStatusBadge'
import { complaintsByRoadId } from '../../data/complaints'
import { findContractsForRoadLabel } from '../../data/contractAwards'
import { formatAwardInr } from '../../lib/currency/formatInr'
import { getRoadBudget } from '../../data/mapRoadBudget'
import { RoadScoreBadge } from '../road/RoadScoreBadge'
import { RiskIndicator } from '../road/RiskIndicator'
import type { MapDisplayMode } from '../../lib/map/constants'
import { getRouteProvider } from '../../lib/map/providers/registry'
import type { MapActiveSelection } from '../../lib/map/types'
import { fadeInUp, springSnappy } from '../../lib/motion'
import { inferPlaceFromCoordinates } from '../../lib/map/inferPlace'
import { fetchLocationIntelligence } from '../../lib/map/locationIntelligence'
import {
  fetchExtendedWeatherIntelligence,
  type ExtendedWeatherIntelligence,
} from '../../lib/map/weatherIntelligence'
import type { LocationWeatherSnapshot } from '../../lib/map/locationIntelligence'
import { routes } from '../../lib/routes'
import {
  buildComplaintPrefillFromLocation,
  buildComplaintPrefillFromRoad,
} from '../../lib/map/complaintPrefill'
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

function hasDisplayValue(value: unknown): value is string | number {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  return !/data unavailable|temporarily unavailable|not published|unknown|unavailable/i.test(trimmed)
}

function openComplaintWithPrefill(
  navigate: ReturnType<typeof useNavigate>,
  persistForNavigation: () => void,
  prefill: ReturnType<typeof buildComplaintPrefillFromRoad>,
) {
  persistForNavigation()
  navigate(routes.complaint, { state: { prefill } })
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
  const submittedComplaintById = useMemo(() => {
    const byId = new Map<string, (typeof submittedComplaints)[number]>()
    for (const entry of submittedComplaints) {
      byId.set(entry.marker.id, entry)
    }
    return byId
  }, [submittedComplaints])
  const selectedRoadBudget = useMemo(() => {
    if (selection?.kind !== 'road') return null
    const start = performance.now()
    const budget = getRoadBudget(
      selection.road.id,
      selection.road.state ?? selection.road.city,
      selection.road.roadName,
    )
    console.info('[RoadWatch perf] roadBudget lookup', {
      roadId: selection.road.id,
      roadName: selection.road.roadName,
      ms: Number((performance.now() - start).toFixed(3)),
    })
    return budget
  }, [selection])
  const selectedContractorMatches = useMemo(() => {
    if (selection?.kind !== 'road') return []
    const start = performance.now()
    const matches = findContractsForRoadLabel(selection.road.roadName, 5, selection.road.state)
    console.info('[RoadWatch perf] contractor lookup', {
      roadId: selection.road.id,
      roadName: selection.road.roadName,
      ms: Number((performance.now() - start).toFixed(3)),
    })
    return matches
  }, [selection])
  const [routeLoading, setRouteLoading] = useState(false)
  const [activePanelTab, setActivePanelTab] = useState<'intelligence' | 'contractor' | 'environment'>(
    'intelligence',
  )
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

  const handleAskAI = () => {
    persistForNavigation()
    let aiState = {}
    if (selection?.kind === 'road') {
      aiState = { contextType: 'road', roadId: selection.road.id, roadName: selection.road.roadName, latitude: selection.road.lat, longitude: selection.road.lng }
    } else if (selection?.kind === 'complaint') {
      const submitted = submittedComplaintById.get(selection.complaint.id)
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
    if (!onZoomToHere || !selection) return
    if (selection.kind === 'location') {
      onZoomToHere(selection.lat, selection.lng)
    } else if (selection.kind === 'road') {
      onZoomToHere(selection.road.lat, selection.road.lng)
    } else if (selection.kind === 'toll') {
      onZoomToHere(selection.toll.lat, selection.toll.lng)
    } else if (selection.kind === 'complaint') {
      onZoomToHere(selection.complaint.lat, selection.complaint.lng)
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
                <button
                  type="button"
                  onClick={() => setActivePanelTab('environment')}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activePanelTab === 'environment'
                      ? 'bg-[var(--rw-primary)] text-white'
                      : 'bg-[var(--rw-surface-muted)] text-[var(--rw-text-secondary)]'
                  }`}
                >
                  Environment
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (selection.kind !== 'location') return
                        openComplaintWithPrefill(
                          navigate,
                          persistForNavigation,
                          buildComplaintPrefillFromLocation(
                            selection.lat,
                            selection.lng,
                            selection.intelligence,
                          ),
                        )
                      }}
                    >
                      {t('fileComplaint')}
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
                    <Button
                      type="button"
                      onClick={() =>
                        openComplaintWithPrefill(
                          navigate,
                          persistForNavigation,
                          buildComplaintPrefillFromRoad(selection.road),
                        )
                      }
                    >
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

                {selection.kind === 'toll' && (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenGoogleMaps}
                    >
                      Open in Google Maps
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openRoutePreview(
                          { lat: selection.toll.lat, lng: selection.toll.lng },
                          selection.toll.name,
                        )
                      }
                    >
                      <Route className="size-4 mr-2" aria-hidden="true" />
                      {t('previewRoute')}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        openComplaintWithPrefill(navigate, persistForNavigation, {
                          lat: selection.toll.lat,
                          lng: selection.toll.lng,
                          locationLabel: selection.toll.name,
                          roadName: selection.toll.name,
                          state: selection.toll.state ?? undefined,
                        })
                      }}
                    >
                      {t('fileComplaint')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAskAI}>
                      <Bot className="size-4 mr-2" aria-hidden="true" />
                      {t('askAIAboutLocation')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleZoomToHere}>
                      Zoom To Plaza
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
                ) : activePanelTab === 'environment' ? (
                  <EnvironmentPanel selection={selection} />
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

                    <p className="text-sm text-[var(--rw-text-secondary)]">
                      Open the Environment tab for weather, AQI, traffic, and visibility.
                    </p>
                  </div>
                ) : null}

                {selection.kind === 'road' ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-[var(--rw-text-secondary)]">
                      {t('contractor')}:{' '}
                      {selection.road.contractor ??
                        selectedContractorMatches[0]?.supplier ??
                        'Unknown contractor'}
                    </p>
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
                      {(() => {
                        const budget = selectedRoadBudget ?? {}
                        const hasBudget =
                          hasDisplayValue(budget.sanctioned) ||
                          hasDisplayValue(budget.released) ||
                          hasDisplayValue(budget.utilized)
                        if (!hasBudget) {
                          return (
                            <div className="border-b border-[var(--rw-border)] py-2 text-sm text-[var(--rw-text-secondary)]">
                              Budget data unavailable
                            </div>
                          )
                        }
                        return (
                          <>
                            {hasDisplayValue(budget.sanctioned) ? (
                              <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                                <dt className="text-[var(--rw-text-secondary)]">Budget Sanctioned</dt>
                                <dd className="font-medium text-[var(--rw-text-primary)]">{budget.sanctioned}</dd>
                              </div>
                            ) : null}
                            {hasDisplayValue(budget.released) ? (
                              <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                                <dt className="text-[var(--rw-text-secondary)]">Budget Released</dt>
                                <dd className="font-medium text-[var(--rw-text-primary)]">{budget.released}</dd>
                              </div>
                            ) : null}
                            {hasDisplayValue(budget.utilized) ? (
                              <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                                <dt className="text-[var(--rw-text-secondary)]">Budget Utilized</dt>
                                <dd className="font-medium text-[var(--rw-text-primary)]">{budget.utilized}</dd>
                              </div>
                            ) : null}
                          </>
                        )
                      })()}
                      {'lastRepairDate' in selection.road && hasDisplayValue(selection.road.lastRepairDate) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('lastRepairDate')}</dt>
                          <dd className="font-medium text-[var(--rw-text-primary)]">
                            {selection.road.lastRepairDate}
                          </dd>
                        </div>
                      ) : null}
                      {(complaintsByRoadId[selection.road.id] ?? []).length > 0 ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('filterComplaints')}</dt>
                          <dd className="font-medium text-[var(--rw-text-primary)]">
                            {(complaintsByRoadId[selection.road.id] ?? []).length}
                          </dd>
                        </div>
                      ) : null}
                      {selection.road.contractor ? (
                        <div className="flex flex-col gap-1 py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('contractor')}</dt>
                          <dd className="font-medium text-[var(--rw-text-primary)]">
                            {selection.road.contractor}
                          </dd>
                        </div>
                      ) : null}
                      {selection.road.authority ? (
                        <div className="flex flex-col gap-1 py-2">
                          <dt className="text-[var(--rw-text-secondary)]">Authority</dt>
                          <dd className="font-medium text-[var(--rw-text-primary)]">
                            {selection.road.authority}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}

                {selection.kind === 'toll' ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <h3 className="text-lg font-semibold text-[var(--rw-text-primary)]">{selection.toll.name}</h3>
                    <dl className="grid gap-2">
                      {hasDisplayValue(selection.toll.nhNumber) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">NH</dt>
                          <dd className="font-medium">{selection.toll.nhNumber}</dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.helplineCrane) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('emergencyCrane')}</dt>
                          <dd className="font-medium">{selection.toll.helplineCrane}</dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.helplineAmbulance) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('emergencyAmbulance')}</dt>
                          <dd className="font-medium">{selection.toll.helplineAmbulance}</dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.helplinePatrol) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('patrolContact')}</dt>
                          <dd className="font-medium">{selection.toll.helplinePatrol}</dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.policeStationContact ?? selection.toll.nearestPoliceStation) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('policeContact')}</dt>
                          <dd className="font-medium">
                            {selection.toll.policeStationContact ?? selection.toll.nearestPoliceStation}
                          </dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.nearestHospitals) ? (
                        <div className="flex justify-between gap-4 border-b border-[var(--rw-border)] py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('nearestHospital')}</dt>
                          <dd className="font-medium">{selection.toll.nearestHospitals}</dd>
                        </div>
                      ) : null}
                      {hasDisplayValue(selection.toll.emergencyServices) ? (
                        <div className="flex justify-between gap-4 py-2">
                          <dt className="text-[var(--rw-text-secondary)]">{t('highwayService')}</dt>
                          <dd className="font-medium">{selection.toll.emergencyServices}</dd>
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

function EnvironmentPanel({ selection }: { selection: MapActiveSelection }) {
  const { t } = useI18n()
  const [roadIntel, setRoadIntel] = useState<LocationWeatherSnapshot | null>(null)
  const [roadWeather, setRoadWeather] = useState<ExtendedWeatherIntelligence | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selection.kind !== 'road') {
      setRoadIntel(null)
      setRoadWeather(null)
      return
    }
    let cancelled = false
    setLoading(true)
    void Promise.all([
      fetchLocationIntelligence(selection.road.lat, selection.road.lng),
      fetchExtendedWeatherIntelligence({ lat: selection.road.lat, lng: selection.road.lng }),
    ])
      .then(([intel, weather]) => {
        if (cancelled) return
        setRoadIntel(intel)
        setRoadWeather(weather)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selection])

  const intelligence =
    selection.kind === 'location'
      ? selection.intelligence
      : selection.kind === 'road'
        ? roadIntel
        : null
  const weatherIntel =
    selection.kind === 'location'
      ? selection.weatherIntel
      : selection.kind === 'road'
        ? roadWeather
        : null

  if (selection.kind !== 'location' && selection.kind !== 'road') {
    return (
      <p className="text-sm text-[var(--rw-text-secondary)]">
        Environment data is available for map locations and roads.
      </p>
    )
  }

  if (loading) {
    return <p className="text-sm text-[var(--rw-text-secondary)]">Loading environment data…</p>
  }

  if (!intelligence) {
    return <p className="text-sm text-[var(--rw-text-secondary)]">No environment data for this selection.</p>
  }

  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {hasDisplayValue(intelligence.temperatureC) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('temperature')}</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(intelligence.temperatureC, 'C')}
          </dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.condition) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
            <Cloud className="size-3.5" aria-hidden="true" />
            {t('condition')}
          </dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">{intelligence.condition}</dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.aqi) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('aqi')}</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">{intelligence.aqi}</dd>
          {hasDisplayValue(intelligence.aqiLabel) ? (
            <dd className="text-xs text-[var(--rw-text-secondary)]">{intelligence.aqiLabel}</dd>
          ) : null}
        </div>
      ) : null}
      {hasDisplayValue(intelligence.humidityPercent) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('humidity')}</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(intelligence.humidityPercent, '%')}
          </dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.windSpeedKph) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">Wind speed</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(intelligence.windSpeedKph, 'km/h')}
          </dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.visibilityKm) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">{t('visibility')}</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(intelligence.visibilityKm, 'km')}
          </dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.rainProbabilityPercent) ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">Rain warning</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(intelligence.rainProbabilityPercent, '%')}
          </dd>
        </div>
      ) : null}
      {weatherIntel && typeof weatherIntel.rainfallMm === 'number' && weatherIntel.rainfallMm > 0 ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">Rainfall</dt>
          <dd className="mt-1 font-semibold text-[var(--rw-text-primary)]">
            {valueWithUnit(weatherIntel.rainfallMm, 'mm')}
          </dd>
        </div>
      ) : null}
      {weatherIntel && typeof weatherIntel.floodRisk === 'number' ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">Flood risk</dt>
          <dd
            className={`mt-1 font-semibold ${
              weatherIntel.floodRisk >= 60
                ? 'text-red-400'
                : weatherIntel.floodRisk >= 30
                  ? 'text-amber-400'
                  : 'text-[var(--rw-text-primary)]'
            }`}
          >
            {weatherIntel.floodRisk}%
          </dd>
        </div>
      ) : null}
      {weatherIntel ? (
        <>
          {weatherIntel.warnings.length > 0 ? (
            <div className="col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <dt className="text-xs font-medium text-amber-200">{t('weatherWarnings')}</dt>
              <dd className="mt-2 space-y-1 text-[var(--rw-text-primary)]">
                {weatherIntel.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </dd>
            </div>
          ) : null}
        </>
      ) : null}
      {(intelligence.observedAt || weatherIntel?.observedAt) ? (
        <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="text-xs text-[var(--rw-text-tertiary)]">Observed at</dt>
          <dd className="mt-1 text-xs font-medium text-[var(--rw-text-secondary)]">
            {(() => {
              const raw = intelligence.observedAt || weatherIntel?.observedAt
              if (!raw) return '—'
              const d = new Date(raw)
              return Number.isNaN(d.getTime())
                ? raw
                : d.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
            })()}
          </dd>
        </div>
      ) : null}
      {hasDisplayValue(intelligence.trafficDescription) ? (
        <div className="col-span-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-3">
          <dt className="flex items-center gap-1 text-xs text-[var(--rw-text-tertiary)]">
            <TrafficCone className="size-3.5" aria-hidden="true" />
            {t('traffic')}
          </dt>
          <dd className="mt-1 font-semibold capitalize text-[var(--rw-text-primary)]">
            {intelligence.trafficCondition}
          </dd>
          <dd className="mt-1 text-xs leading-5 text-[var(--rw-text-secondary)]">
            {intelligence.trafficDescription}
          </dd>
        </div>
      ) : null}
    </dl>
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
  const matches = useMemo(() => {
    if (!roadLabel) return []
    const start = performance.now()
    const result = findContractsForRoadLabel(
      roadLabel,
      5,
      selection.kind === 'road' ? selection.road.state : undefined,
    )
    console.info('[RoadWatch perf] MapDetailOverlay contractor panel lookup', {
      roadName: roadLabel,
      ms: Number((performance.now() - start).toFixed(3)),
    })
    return result
  }, [roadLabel])
  const directContractor = selection.kind === 'road' ? selection.road.contractor : undefined

  if (matches.length === 0 && !directContractor) {
    return (
      <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm text-[var(--rw-text-secondary)]">
        Unknown contractor
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {directContractor && matches.length === 0 ? (
        <div className="rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm">
          <p className="font-semibold text-[var(--rw-text-primary)]">{directContractor}</p>
          <p className="mt-2 text-[var(--rw-text-secondary)]">Linked road contractor record</p>
        </div>
      ) : null}
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
              <dd className="text-right font-medium tabular-nums">{formatAwardInr(row.awardValueUsd)}</dd>
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
