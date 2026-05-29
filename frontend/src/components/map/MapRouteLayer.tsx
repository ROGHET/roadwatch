import { Marker, Polyline } from 'react-leaflet'
import { createRouteEndpointIcon } from '../../lib/map/icons'
import type { RoutePreviewSnapshot } from '../../lib/map/providers/types'

export type MapRouteLayerProps = {
  route: RoutePreviewSnapshot | null
}

function isFiniteCoordinate(point: { lat: number; lng: number }) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
}

function isRenderableRoute(route: RoutePreviewSnapshot) {
  if (route.path.length < 2) return false
  if (!isFiniteCoordinate(route.origin) || !isFiniteCoordinate(route.destination)) return false

  return route.path.every(
    (point) =>
      isFiniteCoordinate(point) &&
      point.lat >= 5 &&
      point.lat <= 38 &&
      point.lng >= 67 &&
      point.lng <= 99,
  )
}

export function MapRouteLayer({ route }: MapRouteLayerProps) {
  if (!route || !isRenderableRoute(route)) {
    return null
  }

  return (
    <>
      <Polyline
        positions={route.path.map((point) => [point.lat, point.lng])}
        className="rw-route-highlight-primary"
        interactive={false}
        bubblingMouseEvents={false}
        pathOptions={{
          color: '#3b82f6',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '10 12',
        }}
      />
      <Marker
        position={[route.origin.lat, route.origin.lng]}
        icon={createRouteEndpointIcon('start')}
        interactive={false}
        bubblingMouseEvents={false}
      />
      <Marker
        position={[route.destination.lat, route.destination.lng]}
        icon={createRouteEndpointIcon('destination')}
        interactive={false}
        bubblingMouseEvents={false}
      />
    </>
  )
}
