import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import {
  ensureRoadDatasetsForViewport,
  MIN_ROAD_RENDER_ZOOM,
  subscribeRoadDatasetUpdates,
} from '../../lib/gis/roadDatasetManager'

const DEBOUNCE_MS = 300

export type MapRoadViewportLoaderProps = {
  onViewportRoadsChange: () => void
}

export function MapRoadViewportLoader({ onViewportRoadsChange }: MapRoadViewportLoaderProps) {
  const map = useMap()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const syncRoads = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        const zoom = map.getZoom()
        if (zoom < MIN_ROAD_RENDER_ZOOM) {
          onViewportRoadsChange()
          return
        }
        void ensureRoadDatasetsForViewport(map.getBounds(), zoom).finally(onViewportRoadsChange)
      }, DEBOUNCE_MS)
    }

    syncRoads()
    map.on('moveend', syncRoads)
    map.on('zoomend', syncRoads)
    const unsubscribe = subscribeRoadDatasetUpdates(syncRoads)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      map.off('moveend', syncRoads)
      map.off('zoomend', syncRoads)
      unsubscribe()
    }
  }, [map, onViewportRoadsChange])

  return null
}
