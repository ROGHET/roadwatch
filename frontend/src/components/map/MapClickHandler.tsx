import { useMapEvents } from 'react-leaflet'
import type { MapDisplayMode } from '../../lib/map/constants'

export type MapClickHandlerProps = {
  mode: MapDisplayMode
  onMapClick: (lat: number, lng: number) => void
}

export function MapClickHandler({ mode, onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      if (mode !== 'expanded') return
      if (event.originalEvent.defaultPrevented) return
      const target = event.originalEvent.target
      if (target instanceof HTMLElement) {
        if (
          target.closest(
            '.leaflet-marker-icon, .leaflet-marker-shadow, .marker-cluster, .marker-cluster *,.rw-map-marker-root, .rw-map-marker-root *',
          )
        ) {
          return
        }
      }
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}
