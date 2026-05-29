import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import type { MapDisplayMode } from '../../lib/map/constants'

export type MapInteractionControllerProps = {
  mode: MapDisplayMode
}

export function MapInteractionController({ mode }: MapInteractionControllerProps) {
  const map = useMap()
  const [showCtrlHint, setShowCtrlHint] = useState(false)
  const isFocusedRef = useRef(false)
  const hintTimerRef = useRef<number | null>(null)

  const interactive = mode === 'expanded'

  useEffect(() => {
    const container = map.getContainer()

    if (!interactive) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
      map.scrollWheelZoom.disable()
      container.style.touchAction = 'pan-y'
      return
    }

    map.dragging.enable()
    map.touchZoom.enable()
    map.doubleClickZoom.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
    map.scrollWheelZoom.disable()
    container.style.touchAction = 'auto'
    container.setAttribute('tabindex', '0')

    const clearHintTimer = () => {
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current)
        hintTimerRef.current = null
      }
    }

    const handleFocusIn = () => {
      isFocusedRef.current = true
    }

    const handleFocusOut = (event: FocusEvent) => {
      if (!container.contains(event.relatedTarget as Node)) {
        isFocusedRef.current = false
        setShowCtrlHint(false)
        clearHintTimer()
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        setShowCtrlHint(false)
        clearHintTimer()
        const delta = event.deltaY > 0 ? -1 : 1
        map.setZoom(map.getZoom() + delta)
        return
      }

      if (isFocusedRef.current) {
        event.preventDefault()
        const nextZoom = map.getZoom() + (event.deltaY > 0 ? -1 : 1)
        map.setZoom(nextZoom)
        return
      }
    }

    const handleWheelHint = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || isFocusedRef.current) return
      if (!container.matches(':hover')) return

      setShowCtrlHint(true)
      clearHintTimer()
      hintTimerRef.current = window.setTimeout(() => setShowCtrlHint(false), 2_500)
    }

    container.addEventListener('focusin', handleFocusIn)
    container.addEventListener('focusout', handleFocusOut)
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('wheel', handleWheelHint, { passive: true })

    return () => {
      container.removeEventListener('focusin', handleFocusIn)
      container.removeEventListener('focusout', handleFocusOut)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('wheel', handleWheelHint)
      container.style.touchAction = ''
      clearHintTimer()
    }
  }, [interactive, map, mode])

  if (!interactive || !showCtrlHint) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute bottom-20 left-1/2 z-[520] -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <p className="rw-map-glass rounded-full px-3 py-1.5 text-xs text-[var(--rw-text-secondary)] shadow-md">
        Hold Ctrl to zoom
      </p>
    </div>
  )
}
