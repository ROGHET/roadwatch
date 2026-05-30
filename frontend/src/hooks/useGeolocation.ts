import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearCachedLocation,
  readCachedLocation,
  writeCachedLocation,
} from '../lib/map/geolocationCache'

export type GeolocationPosition = {
  lat: number
  lng: number
  accuracy: number
  heading: number | null
}

export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'refreshing'
  | 'granted'
  | 'prompt'
  | 'denied'
  | 'unavailable'

export type GeolocationPolicyBlockReason = 'insecure-private-origin' | null

const freshOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 0,
}

const watchOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 10_000,
}

async function readGeolocationPermission(): Promise<PermissionState | null> {
  if (!navigator.permissions?.query) return null

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch {
    return null
  }
}

function getPolicyBlockReason(): GeolocationPolicyBlockReason {
  if (window.isSecureContext) return null

  const hostname = window.location.hostname
  const isPrivateIp =
    /^192\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)

  return isPrivateIp ? 'insecure-private-origin' : null
}

export function useGeolocation(trackHeading = false) {
  const cachedOnMount = readCachedLocation()
  const [position, setPosition] = useState<GeolocationPosition | null>(cachedOnMount)
  const [status, setStatus] = useState<GeolocationStatus>(
    cachedOnMount ? 'granted' : 'idle',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState | 'unsupported' | null>(
    null,
  )
  const [policyBlockReason, setPolicyBlockReason] =
    useState<GeolocationPolicyBlockReason>(null)
  const watchIdRef = useRef<number | null>(null)
  const headingRef = useRef<number | null>(null)
  const refreshInFlightRef = useRef(false)

  const applyPosition = useCallback((coords: GeolocationCoordinates, persist = true) => {
    const next: GeolocationPosition = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      heading: coords.heading ?? headingRef.current,
    }
    setPosition(next)
    setStatus('granted')
    setErrorMessage(null)
    if (persist) {
      writeCachedLocation(next)
    }
    return next
  }, [])

  const handleGeoError = useCallback((error: GeolocationPositionError, keepCache = true) => {
    if (error.code === error.PERMISSION_DENIED) {
      setStatus('denied')
      setErrorMessage(
        'Location access was denied. Enable location permission in your browser settings and try again.',
      )
      if (!keepCache) clearCachedLocation()
      return
    }

    if (error.code === error.TIMEOUT) {
      if (!keepCache || !readCachedLocation()) {
        setStatus('unavailable')
        setErrorMessage('Location request timed out. Please try again.')
      }
      return
    }

    if (!keepCache || !readCachedLocation()) {
      setStatus('unavailable')
      setErrorMessage('Unable to determine your location. Check that location services are enabled.')
    }
  }, [])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const refreshPosition = useCallback((): Promise<GeolocationPosition | null> => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      setErrorMessage('Geolocation is not supported on this device.')
      return Promise.resolve(null)
    }

    if (refreshInFlightRef.current) {
      return Promise.resolve(position)
    }

    refreshInFlightRef.current = true
    setStatus((current) => (current === 'loading' ? 'loading' : 'refreshing'))

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          refreshInFlightRef.current = false
          const next = applyPosition(result.coords)
          resolve(next)
        },
        (error) => {
          refreshInFlightRef.current = false
          handleGeoError(error, true)
          resolve(readCachedLocation() ?? position)
        },
        freshOptions,
      )
    })
  }, [applyPosition, handleGeoError, position])

  const locate = useCallback(async (): Promise<{
    position: GeolocationPosition | null
    usedCache: boolean
  }> => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      setPermissionState('unsupported')
      setErrorMessage('Geolocation is not supported on this device.')
      return { position: null, usedCache: false }
    }

    const blockedByPolicy = getPolicyBlockReason()
    setPolicyBlockReason(blockedByPolicy)
    if (blockedByPolicy) {
      setStatus('unavailable')
      setErrorMessage('Location requires HTTPS or localhost on this browser.')
      return { position: null, usedCache: false }
    }

    const permission = (await readGeolocationPermission()) as PermissionState | null
    setPermissionState(permission ?? 'unsupported')
    if (permission === 'denied') {
      setStatus('denied')
      setErrorMessage(
        'Location access is disabled in your browser.',
      )
      clearCachedLocation()
      return { position: null, usedCache: false }
    }

    if (permission === 'prompt') {
      setStatus('prompt')
    }

    const cached = readCachedLocation()
    if (cached) {
      setPosition(cached)
      setStatus('granted')
      setErrorMessage(null)
      void refreshPosition()
      return { position: cached, usedCache: true }
    }

    setStatus('loading')
    setErrorMessage(null)

    const refreshed = await refreshPosition()
    return { position: refreshed, usedCache: false }
  }, [refreshPosition])

  useEffect(() => {
    let mounted = true

    async function syncPermissionState() {
      const blockedByPolicy = getPolicyBlockReason()
      if (!mounted) return
      setPolicyBlockReason(blockedByPolicy)
      if (blockedByPolicy) {
        setStatus('unavailable')
        setErrorMessage('Location requires HTTPS or localhost on this browser.')
        return
      }

      const permission = (await readGeolocationPermission()) as PermissionState | null
      if (!mounted) return
      setPermissionState(permission ?? 'unsupported')
      if (permission === 'denied') {
        clearCachedLocation()
        setPosition(null)
        setStatus('denied')
        setErrorMessage('Location access is disabled in your browser.')
      }
    }

    void syncPermissionState()
    return () => {
      mounted = false
    }
  }, [])

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return

    stopWatching()
    watchIdRef.current = navigator.geolocation.watchPosition(
      (result) => applyPosition(result.coords),
      (error) => handleGeoError(error, true),
      watchOptions,
    )
  }, [applyPosition, handleGeoError, stopWatching])

  useEffect(() => {
    if (!trackHeading) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading

      let nextHeading: number | null = null

      if (typeof webkitHeading === 'number' && !Number.isNaN(webkitHeading)) {
        nextHeading = webkitHeading
      } else if (event.absolute && event.alpha !== null) {
        nextHeading = 360 - event.alpha
      }

      if (nextHeading === null) return

      headingRef.current = nextHeading
      setPosition((current) => {
        if (!current) return current
        const next = { ...current, heading: nextHeading }
        writeCachedLocation(next)
        return next
      })
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  }, [trackHeading])

  useEffect(() => () => stopWatching(), [stopWatching])

  const clearError = useCallback(() => setErrorMessage(null), [])

  return {
    position,
    status,
    errorMessage,
    permissionState,
    policyBlockReason,
    locate,
    startWatching,
    stopWatching,
    clearError,
  }
}
