import { useMemo, useRef } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { mapRoadMarkers } from '../../data/mapMarkers'
import { createComplaintMarkerIcon, createRoadMarkerIcon } from '../../lib/map/icons'
import type { MapLayerFilter } from '../../lib/map/constants'
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
  complaintMarkers: MapComplaintMarker[]
  userPosition: GeolocationPosition | null
  onSelectRoad: (road: MockRoad) => void
  onSelectComplaint: (complaint: MapComplaintMarker) => void
}

export function MapMarkerLayers({
  filter,
  complaintMarkers,
  userPosition,
  onSelectRoad,
  onSelectComplaint,
}: MapMarkerLayersProps) {
  const onSelectRoadRef = useRef(onSelectRoad)
  const onSelectComplaintRef = useRef(onSelectComplaint)
  onSelectRoadRef.current = onSelectRoad
  onSelectComplaintRef.current = onSelectComplaint

  const showRoads = filter === 'all' || filter === 'roads'
  const showComplaints = filter === 'all' || filter === 'complaints'

  const roadMarkers = useMemo(
    () =>
      mapRoadMarkers.map((road) => (
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
    [],
  )

  const complaintMarkerNodes = useMemo(
    () =>
      complaintMarkers.map((complaint) => (
        <Marker
          key={complaint.id}
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
    [complaintMarkers],
  )

  return (
    <>
      <MapClusterSpiderfyGuard />
      {userPosition ? <UserLocationLayer position={userPosition} /> : null}

      {showRoads ? (
        <MarkerClusterGroup {...clusterGroupProps} maxClusterRadius={56}>
          {roadMarkers}
        </MarkerClusterGroup>
      ) : null}

      {showComplaints ? (
        <MarkerClusterGroup {...clusterGroupProps} maxClusterRadius={48}>
          {complaintMarkerNodes}
        </MarkerClusterGroup>
      ) : null}
    </>
  )
}
