import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { getInitialMapViewport, useMapStore } from '../../stores/mapStore'
import type { MapDisplayMode } from '../../lib/map/constants'

export type MapViewportSyncProps = {
  mode: MapDisplayMode
}

export function MapViewportSync({ mode }: MapViewportSyncProps) {
  const map = useMap()
  const center = useMapStore((state) => state.center)
  const hasUserViewport = useMapStore((state) => state.hasUserViewport)
  const setViewport = useMapStore((state) => state.setViewport)
  const restoredRef = useRef(false)

  useEffect(() => {
    if (mode !== 'expanded') {
      restoredRef.current = false
      return
    }

    if (!restoredRef.current) {
      const initial = getInitialMapViewport(hasUserViewport, center)
      map.setView([initial.lat, initial.lng], initial.zoom, { animate: false })
      restoredRef.current = true
    }

    const handleMoveEnd = () => {
      const mapCenter = map.getCenter()
      setViewport({ lat: mapCenter.lat, lng: mapCenter.lng }, map.getZoom())
    }

    map.on('moveend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
    }
  }, [center, hasUserViewport, map, mode, setViewport])

  return null
}
