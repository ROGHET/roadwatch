import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { MapDisplayMode } from '../../lib/map/constants'

export type MapResizeHandlerProps = {
  mode: MapDisplayMode
  active: boolean
}

export function MapResizeHandler({ mode, active }: MapResizeHandlerProps) {
  const map = useMap()

  useEffect(() => {
    if (!active) return

    const refresh = () => {
      map.invalidateSize({ animate: false })
    }

    refresh()
    const timer = window.setTimeout(refresh, 150)
    const raf = window.requestAnimationFrame(refresh)

    return () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(raf)
    }
  }, [active, map, mode])

  return null
}
