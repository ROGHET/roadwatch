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
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}
