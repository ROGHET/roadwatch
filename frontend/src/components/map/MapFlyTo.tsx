import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export type MapFlyToProps = {
  lat: number
  lng: number
  zoom?: number
  trigger: number
}

export function MapFlyTo({ lat, lng, zoom, trigger }: MapFlyToProps) {
  const map = useMap()

  useEffect(() => {
    if (trigger === 0) return

    map.flyTo([lat, lng], zoom ?? 18, {
      duration: 1.5,
    })
  }, [lat, lng, map, trigger, zoom])

  return null
}
