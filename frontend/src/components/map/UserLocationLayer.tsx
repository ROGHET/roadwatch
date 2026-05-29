import { Circle, Marker } from 'react-leaflet'
import { useMemo } from 'react'
import type { GeolocationPosition } from '../../hooks/useGeolocation'
import { USER_LOCATION_COLOR } from '../../lib/map/constants'
import { createUserLocationIcon } from '../../lib/map/icons'

export type UserLocationLayerProps = {
  position: GeolocationPosition
}

export function UserLocationLayer({ position }: UserLocationLayerProps) {
  const icon = useMemo(
    () => createUserLocationIcon(position.heading),
    [position.heading],
  )

  return (
    <>
      <Circle
        center={[position.lat, position.lng]}
        radius={Math.max(position.accuracy, 25)}
        pathOptions={{
          color: USER_LOCATION_COLOR,
          fillColor: USER_LOCATION_COLOR,
          fillOpacity: 0.15,
          weight: 1,
          opacity: 0.5,
        }}
      />
      <Marker
        position={[position.lat, position.lng]}
        icon={icon}
        zIndexOffset={1000}
      />
    </>
  )
}
