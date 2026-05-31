import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { ensureRoadDatasetsForViewport } from '../../lib/gis/roadDatasetManager'

const DEBOUNCE_MS = 350

export function MapRoadViewportLoader() {
  const map = useMap()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const syncRoads = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        void ensureRoadDatasetsForViewport(map.getBounds(), map.getZoom())
      }, DEBOUNCE_MS)
    }

    syncRoads()
    map.on('moveend', syncRoads)
    map.on('zoomend', syncRoads)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      map.off('moveend', syncRoads)
      map.off('zoomend', syncRoads)
    }
  }, [map])

  return null
}
