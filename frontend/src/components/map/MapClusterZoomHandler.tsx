import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'

type ClusterLayer = L.MarkerClusterGroup & {
  getBounds?: () => L.LatLngBounds
}

type ClusterClickEvent = {
  layer: ClusterLayer
}

function isMarkerClusterGroup(layer: L.Layer): layer is L.MarkerClusterGroup {
  return layer instanceof L.MarkerClusterGroup
}

export function MapClusterZoomHandler() {
  const map = useMap()

  useEffect(() => {
    const attached = new WeakSet<L.MarkerClusterGroup>()

    function handleClusterClick(event: ClusterClickEvent) {
      const cluster = event.layer
      const bounds = cluster.getBounds?.()
      if (!bounds?.isValid()) return
      map.fitBounds(bounds.pad(0.12), { maxZoom: 15, animate: true })
    }

    function attachGroup(group: L.MarkerClusterGroup) {
      if (attached.has(group)) return
      attached.add(group)
      group.on('clusterclick', handleClusterClick)
    }

    function handleLayerAdd(event: L.LeafletEvent) {
      if ('layer' in event && event.layer instanceof L.Layer && isMarkerClusterGroup(event.layer)) {
        attachGroup(event.layer)
      }
    }

    map.eachLayer((layer) => {
      if (isMarkerClusterGroup(layer)) attachGroup(layer)
    })
    map.on('layeradd', handleLayerAdd)

    return () => {
      map.off('layeradd', handleLayerAdd)
      map.eachLayer((layer) => {
        if (isMarkerClusterGroup(layer)) {
          layer.off('clusterclick', handleClusterClick)
        }
      })
    }
  }, [map])

  return null
}
