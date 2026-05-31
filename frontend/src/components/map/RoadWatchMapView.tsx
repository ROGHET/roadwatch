import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import '../../lib/map/leafletDefaults'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { mapRoadMarkers, setMapRoadMarkers } from '../../data/mapMarkers'
import { attachGeoCoordinatesToReports, infrastructureReports } from '../../data/infrastructureReports'
import { setRoadCatalog } from '../../data/roads'
import {
  buildRoadFromCoordinates,
  findNearestGeoRoad,
  geoRoadToMockRoad,
  getGeoRoadFeaturesSnapshot,
  loadGeoRoadFeatures,
  subscribeGeoRoadFeatures,
} from '../../lib/gis/geoRoadIndex'
import { findNearestTollPlaza, type TollPlazaRecord } from '../../data/tollPlazas'
import { MapGeoLayers } from './MapGeoLayers'
import { MapClusterZoomHandler } from './MapClusterZoomHandler'
import { MapLayerLegend } from './MapLayerLegend'
import { MapRoadViewportLoader } from './MapRoadViewportLoader'
import { fetchExtendedWeatherIntelligence, toWeatherRiskInput } from '../../lib/map/weatherIntelligence'
import { getMergedComplaintMarkers } from '../../lib/complaints/mergedComplaints'
import { useGeolocation } from '../../hooks/useGeolocation'
import { inferPlaceFromCoordinates } from '../../lib/map/inferPlace'
import { fetchLocationIntelligence } from '../../lib/map/locationIntelligence'
import {
  getRecentNominatimSearches,
  searchNominatim,
  type NominatimSearchResult,
} from '../../lib/map/nominatimSearch'
import { routes } from '../../lib/routes'
import { fetchComplaints } from '../../lib/api/complaints'
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  PREVIEW_ZOOM,
  ROAD_FOCUS_ZOOM,
  USER_LOCATION_ZOOM,
  type MapDisplayMode,
} from '../../lib/map/constants'
import type { MapComplaintMarker } from '../../lib/map/types'
import type { MockRoad } from '../../data/roads'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../../stores/complaintStore'
import { getInitialMapViewport, useMapStore } from '../../stores/mapStore'
import { MapClickHandler } from './MapClickHandler'
import { MapDetailOverlay } from './MapDetailOverlay'
import { MapFilterPanel } from './MapFilterPanel'
import { MapFlyTo } from './MapFlyTo'
import {
  MapFloatingControls,
  type MapSearchResult,
} from './MapFloatingControls'
import { MapInteractionController } from './MapInteractionController'
import { MapMarkerLayers } from './MapMarkerLayers'
import { MapRouteLayer } from './MapRouteLayer'
import { MapResizeHandler } from './MapResizeHandler'
import { MapThemeTileLayer } from './MapThemeTileLayer'
import { MapViewportSync } from './MapViewportSync'
import { MapContainer, ZoomControl } from 'react-leaflet'

export type RoadWatchMapViewProps = {
  mode?: MapDisplayMode
}

export default function RoadWatchMapView({ mode = 'expanded' }: RoadWatchMapViewProps) {
  const navigate = useNavigate()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)
  const complaintPickMode = useComplaintStore((state) => state.complaintPickMode)
  const locationPickPending = useComplaintStore((state) => state.locationPickPending)
  const completeLocationPick = useComplaintStore((state) => state.completeLocationPick)
  const [geocodedComplaintMarkers, setGeocodedComplaintMarkers] = useState<MapComplaintMarker[]>([])

  useEffect(() => {
    if (mode !== 'expanded') return
    let cancelled = false

    const syncRoadCatalog = (features: ReturnType<typeof getGeoRoadFeaturesSnapshot>) => {
      const namedRoads = features
        .filter((feature) => feature.name && !feature.name.startsWith('Road segment'))
        .slice(0, 500)
        .map((feature) => geoRoadToMockRoad(feature))
      setMapRoadMarkers(namedRoads)
      setRoadCatalog(namedRoads)
      const geocoded = attachGeoCoordinatesToReports(infrastructureReports, features)
      setGeocodedComplaintMarkers(
        geocoded.map((complaint) => ({
          ...complaint,
          roadId: complaint.roadId,
          lat: complaint.lat,
          lng: complaint.lng,
        })),
      )
    }

    void loadGeoRoadFeatures().then((features) => {
      if (cancelled) return
      syncRoadCatalog(features)
    })

    const unsubscribe = subscribeGeoRoadFeatures(() => {
      if (cancelled) return
      syncRoadCatalog(getGeoRoadFeaturesSnapshot())
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [mode])

  const complaintMarkers = useMemo(
    () => [...getMergedComplaintMarkers(submittedComplaints), ...geocodedComplaintMarkers],
    [geocodedComplaintMarkers, submittedComplaints],
  )

  useEffect(() => {
    if (mode !== 'expanded') return
    let cancelled = false

    async function loadComplaints() {
      try {
        const complaints = await fetchComplaints()
        if (cancelled) return
        setSubmittedComplaints(complaints.map((complaint) => buildStoredSubmittedComplaint(complaint)))
      } catch {
        // Keep existing mock/local markers if the API is unavailable.
      }
    }

    void loadComplaints()
    return () => {
      cancelled = true
    }
  }, [mode, setSubmittedComplaints])

  const filter = useMapStore((state) => state.filter)
  const layerToggles = useMapStore((state) => state.layerToggles)
  const severityFilters = useMapStore((state) => state.severityFilters)
  const roadTypeFilters = useMapStore((state) => state.roadTypeFilters)
  const selection = useMapStore((state) => state.selection)
  const routePreview = useMapStore((state) => state.routePreview)
  const center = useMapStore((state) => state.center)
  const hasUserViewport = useMapStore((state) => state.hasUserViewport)
  const setFilter = useMapStore((state) => state.setFilter)
  const setSeverityFilters = useMapStore((state) => state.setSeverityFilters)
  const setRoadTypeFilters = useMapStore((state) => state.setRoadTypeFilters)
  const toggleSeverityFilter = useMapStore((state) => state.toggleSeverityFilter)
  const toggleRoadTypeFilter = useMapStore((state) => state.toggleRoadTypeFilter)
  const setSelection = useMapStore((state) => state.setSelection)
  const clearSelection = useMapStore((state) => state.clearSelection)
  const [filterOpen, setFilterOpen] = useState(false)
  const [roadTypeQuery, setRoadTypeQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [nominatimResults, setNominatimResults] = useState<NominatimSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchPin, setSearchPin] = useState<{ lat: number; lng: number } | null>(null)
  const [intelLoading, setIntelLoading] = useState(false)
  const [flyTarget, setFlyTarget] = useState<{
    lat: number
    lng: number
    zoom: number
    trigger: number
  }>(() => {
    const initial = getInitialMapViewport(hasUserViewport, center)
    return {
      lat: initial.lat,
      lng: initial.lng,
      zoom: mode === 'preview' ? PREVIEW_ZOOM : initial.zoom,
      trigger: 0,
    }
  })

  const {
    position: userPosition,
    status: locateStatus,
    errorMessage,
    permissionState,
    policyBlockReason,
    locate,
    startWatching,
    stopWatching,
    clearError,
  } = useGeolocation(mode === 'expanded')

  const searchResults = useMemo<MapSearchResult[]>(() => {
    if (mode !== 'expanded') return []

    const query = searchQuery.trim().toLowerCase()
    if (!query) return getRecentNominatimSearches().map((item) => ({
      id: item.id,
      kind: item.kind === 'coordinates' ? 'place' as const : item.kind,
      label: item.label,
      description: item.description,
      lat: item.lat,
      lng: item.lng,
    }))

    const roadResults: MapSearchResult[] = mapRoadMarkers
      .filter(
        (road) =>
          road.roadName.toLowerCase().includes(query) ||
          road.roadType?.toLowerCase().includes(query) ||
          road.authority?.toLowerCase().includes(query),
      )
      .map((road) => ({
        id: road.id,
        kind: 'road' as const,
        label: road.roadName,
        description: road.roadType ?? 'Monitored road corridor',
        lat: road.lat,
        lng: road.lng,
      }))

    const complaintResults: MapSearchResult[] = complaintMarkers
      .filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(query) ||
          complaint.roadName?.toLowerCase().includes(query) ||
          complaint.referenceId?.toLowerCase().includes(query),
      )
      .map((complaint) => ({
        id: complaint.id,
        kind: 'complaint' as const,
        label: complaint.title,
        description: complaint.roadName ?? 'Citizen complaint',
        lat: complaint.lat,
        lng: complaint.lng,
      }))

    const placeResults: MapSearchResult[] = nominatimResults.map((item) => ({
      id: item.id,
      kind: 'place' as const,
      label: item.label,
      description: item.description,
      lat: item.lat,
      lng: item.lng,
    }))

    return [...placeResults, ...roadResults, ...complaintResults].slice(0, 10)
  }, [complaintMarkers, mode, nominatimResults, searchQuery])

  useEffect(() => {
    if (mode !== 'expanded') return
    const query = searchQuery.trim()
    if (query.length < 2) {
      setNominatimResults([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setSearchLoading(true)
      void searchNominatim(query)
        .then((results) => {
          if (!cancelled) setNominatimResults(results)
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false)
        })
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [mode, searchQuery])

  useEffect(() => {
    if (mode === 'expanded') {
      if (locateStatus === 'granted') {
        startWatching()
      }
      return () => stopWatching()
    }
    stopWatching()
    return undefined
  }, [mode, locateStatus, startWatching, stopWatching])

  const focusOn = useCallback((lat: number, lng: number, zoom: number) => {
    setFlyTarget((current) => ({
      lat,
      lng,
      zoom,
      trigger: current.trigger + 1,
    }))
  }, [])

  const handleSelectRoad = useCallback((road: MockRoad) => {
    if (mode !== 'expanded') return
    setSelection({ kind: 'road', road })
  }, [mode, setSelection])

  const handleSelectComplaint = useCallback((complaint: MapComplaintMarker) => {
    if (mode !== 'expanded') return
    setSelection({ kind: 'complaint', complaint })
  }, [mode, setSelection])

  const handleSelectToll = useCallback((toll: TollPlazaRecord) => {
    if (mode !== 'expanded') return
    setSelection({ kind: 'toll', toll })
  }, [mode, setSelection])

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (mode !== 'expanded' || intelLoading) return

    setIntelLoading(true)
    try {
      const [intelligence, weatherIntel] = await Promise.all([
        fetchLocationIntelligence(lat, lng),
        fetchExtendedWeatherIntelligence({ lat, lng }),
        loadGeoRoadFeatures(),
      ])

      const geoFeatures = getGeoRoadFeaturesSnapshot()
      const nearestRoad = findNearestGeoRoad(geoFeatures, lat, lng)
      if (nearestRoad) {
        const road = buildRoadFromCoordinates(geoFeatures, lat, lng, toWeatherRiskInput(weatherIntel))
        if (road) {
          setSelection({ kind: 'road', road })
          return
        }
      }

      const nearestToll = findNearestTollPlaza(lat, lng, 8)
      if (nearestToll && !nearestRoad) {
        setSelection({ kind: 'toll', toll: nearestToll })
        return
      }

      if (complaintPickMode && locationPickPending) {
        const place = inferPlaceFromCoordinates(lat, lng)
        completeLocationPick(
          lat,
          lng,
          intelligence.locationName || place.label,
          intelligence.city || place.city,
          intelligence.state || place.state,
        )
        navigate(routes.complaint)
        return
      }

      setSelection({ kind: 'location', lat, lng, intelligence, weatherIntel })
    } finally {
      setIntelLoading(false)
    }
  }, [
    complaintPickMode,
    completeLocationPick,
    intelLoading,
    locationPickPending,
    mode,
    navigate,
    setSelection,
  ])

  const handleSearchResultSelect = async (result: MapSearchResult) => {
    focusOn(result.lat, result.lng, ROAD_FOCUS_ZOOM)
    setSearchPin({ lat: result.lat, lng: result.lng })
    if (result.kind === 'road') {
      const road = mapRoadMarkers.find((record) => record.id === result.id)
      if (road) handleSelectRoad(road)
    } else if (result.kind === 'complaint') {
      const complaint = complaintMarkers.find((record) => record.id === result.id)
      if (complaint) handleSelectComplaint(complaint)
    } else {
      setIntelLoading(true)
      try {
        const [intelligence, weatherIntel] = await Promise.all([
          fetchLocationIntelligence(result.lat, result.lng),
          fetchExtendedWeatherIntelligence({ lat: result.lat, lng: result.lng }),
        ])
        setSelection({ kind: 'location', lat: result.lat, lng: result.lng, intelligence, weatherIntel })
      } finally {
        setIntelLoading(false)
      }
    }
    setSearchQuery('')
    setNominatimResults([])
  }

  const handleSearchClose = () => {
    setSearchQuery('')
    setNominatimResults([])
    setSearchPin(null)
  }

  const handleLocate = useCallback(async () => {
    clearError()
    const { position: located, usedCache } = await locate()
    if (located) {
      focusOn(located.lat, located.lng, USER_LOCATION_ZOOM)
    }
    if (!located && !usedCache) {
      return
    }
  }, [clearError, focusOn, locate])

  useEffect(() => {
    if (mode !== 'expanded' || locateStatus !== 'idle') return
    void handleLocate()
  }, [handleLocate, locateStatus, mode])

  const initialViewport = getInitialMapViewport(
    hasUserViewport,
    mode === 'preview' ? { ...center, zoom: PREVIEW_ZOOM } : center,
  )

  return (
    <div
      className={[
        'absolute inset-0 overflow-hidden bg-[var(--rw-background)]',
        mode === 'preview' ? 'rw-map-preview' : 'rw-map-expanded',
      ].join(' ')}
    >
      <MapContainer
        center={[initialViewport.lat, initialViewport.lng]}
        zoom={initialViewport.zoom}
        className="rw-map-tiles absolute inset-0 z-0"
        zoomControl={false}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        worldCopyJump={true}
        attributionControl={mode === 'expanded'}
        scrollWheelZoom={false}
      >
        <MapThemeTileLayer />
        {mode === 'expanded' ? <ZoomControl position="bottomleft" /> : null}
        <MapResizeHandler mode={mode} active={mode === 'expanded'} />
        <MapViewportSync mode={mode} />
        <MapInteractionController mode={mode} />
        <MapClickHandler mode={mode} onMapClick={handleMapClick} />
        <MapFlyTo
          lat={flyTarget.lat}
          lng={flyTarget.lng}
          zoom={flyTarget.zoom}
          trigger={flyTarget.trigger}
        />
        {mode === 'expanded' ? (
          <>
            <MapRoadViewportLoader />
            <MapClusterZoomHandler />
            <MapGeoLayers
              showRoads={layerToggles.roads}
              showTolls={layerToggles.tollPlazas}
              onSelectRoad={handleSelectRoad}
              onSelectToll={handleSelectToll}
            />
          </>
        ) : null}
        <MapMarkerLayers
          filter={filter}
          severityFilters={severityFilters}
          roadTypeFilters={roadTypeFilters}
          complaintMarkers={complaintMarkers}
          showComplaints={layerToggles.complaints}
          userPosition={mode === 'expanded' ? userPosition : null}
          onSelectRoad={handleSelectRoad}
          onSelectComplaint={handleSelectComplaint}
        />
        {searchPin ? (
          <Marker
            position={[searchPin.lat, searchPin.lng]}
            icon={L.divIcon({
              className: '',
              html: '<div class="rw-search-pin size-4 rounded-full border-2 border-white bg-[var(--st-primary)] shadow-lg"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        ) : null}
      <MapRouteLayer route={routePreview} />
      </MapContainer>

      {complaintPickMode ? (
        <p
          className="pointer-events-none absolute bottom-4 left-1/2 z-[510] -translate-x-1/2 rounded-full bg-[var(--rw-primary)] px-4 py-2 text-xs font-medium text-white shadow-md"
          role="status"
        >
          Tap the map to set the complaint location
        </p>
      ) : null}

      {intelLoading ? (
        <p
          className="pointer-events-none absolute bottom-4 left-1/2 z-[510] -translate-x-1/2 rounded-full bg-[var(--rw-surface)]/90 px-3 py-1 text-xs text-[var(--rw-text-secondary)] shadow-md"
          role="status"
        >
          Loading location data
        </p>
      ) : null}

      <MapFloatingControls
        mode={mode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onSearchResultSelect={handleSearchResultSelect}
        onSearchClose={handleSearchClose}
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        onLocate={handleLocate}
        locateStatus={locateStatus}
        locateMessage={errorMessage}
        locatePermissionState={permissionState}
        locatePolicyBlockReason={policyBlockReason}
      />

      <MapFilterPanel
        open={filterOpen && mode === 'expanded'}
        filter={filter}
        severityFilters={severityFilters}
        roadTypeFilters={roadTypeFilters}
        onFilterChange={setFilter}
        onToggleSeverity={toggleSeverityFilter}
        onToggleRoadType={toggleRoadTypeFilter}
        onClearFilters={() => {
          setFilter('all')
          setSeverityFilters([])
          setRoadTypeFilters([])
        }}
        onClose={() => setFilterOpen(false)}
        roadTypeQuery={roadTypeQuery}
        onRoadTypeQueryChange={setRoadTypeQuery}
      />

      <MapDetailOverlay
        mode={mode}
        selection={selection}
        userLocation={userPosition}
        onClose={clearSelection}
        onZoomToHere={(lat, lng) => focusOn(lat, lng, ROAD_FOCUS_ZOOM)}
      />

      {mode === 'expanded' ? <MapLayerLegend /> : null}
    </div>
  )
}
