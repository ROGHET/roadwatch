import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { mapComplaintMarkers, mapRoadMarkers } from '../../data/mapMarkers'
import { createComplaintMarkerIcon, createRoadMarkerIcon } from '../../lib/map/icons'
import type { MapLayerFilter } from '../../lib/map/constants'
import type { GeolocationPosition } from '../../hooks/useGeolocation'
import type { MapComplaintMarker } from '../../lib/map/types'
import type { MockRoad } from '../../data/roads'
import { UserLocationLayer } from './UserLocationLayer'

export type MapMarkerLayersProps = {
  filter: MapLayerFilter
  userPosition: GeolocationPosition | null
  onSelectRoad: (road: MockRoad) => void
  onSelectComplaint: (complaint: MapComplaintMarker) => void
}

export function MapMarkerLayers({
  filter,
  userPosition,
  onSelectRoad,
  onSelectComplaint,
}: MapMarkerLayersProps) {
  const showRoads = filter === 'all' || filter === 'roads'
  const showComplaints = filter === 'all' || filter === 'complaints'

  return (
    <>
      {userPosition ? <UserLocationLayer position={userPosition} /> : null}

      {showRoads ? (
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={56}
        >
          {mapRoadMarkers.map((road) => (
            <Marker
              key={road.id}
              position={[road.lat, road.lng]}
              icon={createRoadMarkerIcon(road.status)}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            />
          ))}
        </MarkerClusterGroup>
      ) : null}

      {showComplaints ? (
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={48}
        >
          {mapComplaintMarkers.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[complaint.lat, complaint.lng]}
              icon={createComplaintMarkerIcon(complaint.severity ?? 'medium')}
              eventHandlers={{
                click: () => onSelectComplaint(complaint),
              }}
            />
          ))}
        </MarkerClusterGroup>
      ) : null}
    </>
  )
}
