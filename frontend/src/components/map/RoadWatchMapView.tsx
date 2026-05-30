import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import '../../lib/map/leafletDefaults'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { mapComplaintMarkers, mapRoadMarkers } from '../../data/mapMarkers'
import { useGeolocation } from '../../hooks/useGeolocation'
import { fetchLocationIntelligence } from '../../lib/map/locationIntelligence'
import {
  INDIA_MAP_MAX_BOUNDS,
  MAP_MAX_BOUNDS_VISCOSITY,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  PREVIEW_ZOOM,
  ROAD_FOCUS_ZOOM,
  USER_LOCATION_ZOOM,
  type MapDisplayMode,
} from '../../lib/map/constants'
import type { MapComplaintMarker } from '../../lib/map/types'
import type { MockRoad } from '../../data/roads'
import { getInitialMapViewport, useMapStore } from '../../stores/mapStore'
import { MapClickHandler } from './MapClickHandler'
import { MapDetailOverlay } from './MapDetailOverlay'
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

export type RoadWatchMapViewProps = {
  mode?: MapDisplayMode
}

export default function RoadWatchMapView({ mode = 'expanded' }: RoadWatchMapViewProps) {
  const filter = useMapStore((state) => state.filter)
  const selection = useMapStore((state) => state.selection)
  const routePreview = useMapStore((state) => state.routePreview)
  const center = useMapStore((state) => state.center)
  const hasUserViewport = useMapStore((state) => state.hasUserViewport)
  const setFilter = useMapStore((state) => state.setFilter)
  const setSelection = useMapStore((state) => state.setSelection)
  const clearSelection = useMapStore((state) => state.clearSelection)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
    if (!query) return []

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

    const complaintResults: MapSearchResult[] = mapComplaintMarkers
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

    return [...roadResults, ...complaintResults].slice(0, 8)
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

  const handleSelectRoad = (road: MockRoad) => {
    if (mode !== 'expanded') return
    setSelection({ kind: 'road', road })
  }

  const handleSelectComplaint = (complaint: MapComplaintMarker) => {
    if (mode !== 'expanded') return
    setSelection({ kind: 'complaint', complaint })
  }

  const handleMapClick = async (lat: number, lng: number) => {
    if (mode !== 'expanded' || intelLoading) return

    setIntelLoading(true)
    try {
      const intelligence = await fetchLocationIntelligence(lat, lng)
      setSelection({ kind: 'location', lat, lng, intelligence })
    } finally {
      setIntelLoading(false)
    }
  }

  const handleSearchResultSelect = (result: MapSearchResult) => {
    focusOn(result.lat, result.lng, ROAD_FOCUS_ZOOM)
    if (result.kind === 'road') {
      const road = mapRoadMarkers.find((record) => record.id === result.id)
      if (road) handleSelectRoad(road)
    } else {
      const complaint = mapComplaintMarkers.find((record) => record.id === result.id)
      if (complaint) handleSelectComplaint(complaint)
    }
    setSearchQuery('')
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
        maxBounds={INDIA_MAP_MAX_BOUNDS}
        maxBoundsViscosity={MAP_MAX_BOUNDS_VISCOSITY}
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
        <MapMarkerLayers
          filter={filter}
          userPosition={mode === 'expanded' ? userPosition : null}
          onSelectRoad={handleSelectRoad}
          onSelectComplaint={handleSelectComplaint}
        />
      <MapRouteLayer route={routePreview} />
      </MapContainer>

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
        onSearchResultSelect={handleSearchResultSelect}
        filter={filter}
        onFilterChange={setFilter}
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        onLocate={handleLocate}
        locateStatus={locateStatus}
        locateMessage={errorMessage}
        locatePermissionState={permissionState}
        locatePolicyBlockReason={policyBlockReason}
      />

      <MapDetailOverlay
        mode={mode}
        selection={selection}
        userLocation={userPosition}
        onClose={clearSelection}
        onZoomToHere={(lat, lng) => focusOn(lat, lng, ROAD_FOCUS_ZOOM)}
      />
    </div>
  )
}
