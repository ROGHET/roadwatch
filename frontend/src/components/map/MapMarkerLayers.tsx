import { memo, useMemo, useRef } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { mapRoadMarkers } from '../../data/mapMarkers'
import type { ComplaintSeverity } from '../complaints/ComplaintCard'
import { createComplaintMarkerIcon, createRoadMarkerIcon } from '../../lib/map/icons'
import type { MapLayerFilter } from '../../lib/map/constants'
import type { MapRoadTypeFilter } from '../../lib/map/nominatimSearch'
import type { GeolocationPosition } from '../../hooks/useGeolocation'
import type { MapComplaintMarker } from '../../lib/map/types'
import type { MockRoad } from '../../data/roads'
import { MapClusterSpiderfyGuard } from './MapClusterSpiderfyGuard'
import { UserLocationLayer } from './UserLocationLayer'

const clusterGroupProps = {
  chunkedLoading: true,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  bubblingMouseEvents: false,
} as const

export type MapMarkerLayersProps = {
  filter: MapLayerFilter
  severityFilters: ComplaintSeverity[]
  roadTypeFilters: MapRoadTypeFilter[]
  complaintMarkers: MapComplaintMarker[]
  showComplaints?: boolean
  userPosition: GeolocationPosition | null
  onSelectRoad: (road: MockRoad) => void
  onSelectComplaint: (complaint: MapComplaintMarker) => void
}

function matchesRoadTypeFilter(roadType: string | undefined, filters: MapRoadTypeFilter[]) {
  if (filters.length === 0) return true
  if (!roadType) return false
  return filters.some((filter) => roadType.toLowerCase().includes(filter.toLowerCase()))
}

export const MapMarkerLayers = memo(function MapMarkerLayers({
  filter,
  severityFilters,
  roadTypeFilters,
  complaintMarkers,
  showComplaints = true,
  userPosition,
  onSelectRoad,
  onSelectComplaint,
}: MapMarkerLayersProps) {
  const onSelectRoadRef = useRef(onSelectRoad)
  const onSelectComplaintRef = useRef(onSelectComplaint)
  onSelectRoadRef.current = onSelectRoad
  onSelectComplaintRef.current = onSelectComplaint

  const showRoadMarkers = false
  const showComplaintLayer = showComplaints && (filter === 'all' || filter === 'complaints')

  const filteredRoads = useMemo(
    () =>
      mapRoadMarkers.filter((road) => matchesRoadTypeFilter(road.roadType, roadTypeFilters)),
    [roadTypeFilters],
  )

  const filteredComplaints = useMemo(
    () =>
      complaintMarkers.filter((complaint) => {
        const severityMatch =
          severityFilters.length === 0 ||
          severityFilters.includes((complaint.severity ?? 'medium') as ComplaintSeverity)
        const roadTypeMatch = matchesRoadTypeFilter(complaint.roadType, roadTypeFilters)
        return severityMatch && roadTypeMatch
      }),
    [complaintMarkers, roadTypeFilters, severityFilters],
  )

  const roadMarkers = useMemo(
    () =>
      filteredRoads.map((road) => (
        <Marker
          key={road.id}
          position={[road.lat, road.lng]}
          icon={createRoadMarkerIcon(road.status)}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: (event) => {
              L.DomEvent.stop(event.originalEvent)
              L.DomEvent.stopPropagation(event.originalEvent)
              onSelectRoadRef.current(road)
            },
          }}
        />
      )),
    [filteredRoads],
  )

  const complaintMarkerNodes = useMemo(
    () =>
      filteredComplaints.map((complaint) => (
        <Marker
          key={[
            complaint.referenceId ?? complaint.id,
            complaint.id,
            complaint.lat.toFixed(5),
            complaint.lng.toFixed(5),
          ].join(':')}
          position={[complaint.lat, complaint.lng]}
          icon={createComplaintMarkerIcon(complaint.severity ?? 'medium')}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: (event) => {
              L.DomEvent.stop(event.originalEvent)
              L.DomEvent.stopPropagation(event.originalEvent)
              onSelectComplaintRef.current(complaint)
            },
          }}
        />
      )),
    [filteredComplaints],
  )

  return (
    <>
      <MapClusterSpiderfyGuard />
      {userPosition ? <UserLocationLayer position={userPosition} /> : null}

      {showRoadMarkers ? (
        <MarkerClusterGroup {...clusterGroupProps} maxClusterRadius={56}>
          {roadMarkers}
        </MarkerClusterGroup>
      ) : null}

      {showComplaintLayer ? (
        <MarkerClusterGroup {...clusterGroupProps} maxClusterRadius={48}>
          {complaintMarkerNodes}
        </MarkerClusterGroup>
      ) : null}
    </>
  )
})
