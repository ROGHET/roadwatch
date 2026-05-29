import L from 'leaflet'
import 'leaflet.markercluster'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type SpiderfyClusterGroup = L.MarkerClusterGroup & {
  _unspiderfyWrapper?: () => void
  _unspiderfy?: () => void
}

function isMarkerClusterGroup(layer: L.Layer): layer is SpiderfyClusterGroup {
  return layer instanceof L.MarkerClusterGroup
}

function shouldIgnoreUnspiderfy(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      '.leaflet-marker-icon, .leaflet-marker-shadow, .marker-cluster, .marker-cluster-spider-leg, .rw-map-marker-root',
    ),
  )
}

/**
 * Leaflet.markercluster unspiderfies on every map click by default.
 * Ignore clicks that originate on spiderfied markers so users can inspect siblings.
 */
export function MapClusterSpiderfyGuard() {
  const map = useMap()

  useEffect(() => {
    const patchedGroups = new WeakSet<SpiderfyClusterGroup>()

    const patchClusterGroup = (layer: L.Layer) => {
      if (!isMarkerClusterGroup(layer) || patchedGroups.has(layer)) return

      if (layer._unspiderfyWrapper) {
        map.off('click', layer._unspiderfyWrapper, layer)
      }
      patchedGroups.add(layer)
    }

    const handleMapClick = (event: L.LeafletMouseEvent) => {
      if (shouldIgnoreUnspiderfy(event.originalEvent.target)) return

      map.eachLayer((layer) => {
        if (isMarkerClusterGroup(layer)) {
          layer._unspiderfy?.()
        }
      })
    }

    const handleLayerAdd = (event: L.LeafletEvent) => {
      if ('layer' in event && event.layer instanceof L.Layer) {
        patchClusterGroup(event.layer)
      }
    }

    map.eachLayer(patchClusterGroup)
    map.on('layeradd', handleLayerAdd)
    map.on('click', handleMapClick)

    return () => {
      map.off('layeradd', handleLayerAdd)
      map.off('click', handleMapClick)
    }
  }, [map])

  return null
}
