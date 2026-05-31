import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { INDIA_CENTER } from '../../lib/map/constants'
import { createTollClusterSummaryIcon, createTollPlazaIcon } from '../../lib/map/icons'
import type { TollPlazaRecord } from '../../data/tollPlazas'

const TOLL_DETAIL_ZOOM = 8

export type MapGeoLayersProps = {
  showTolls?: boolean
  onSelectToll: (toll: TollPlazaRecord) => void
}

const TollMarker = memo(function TollMarker({
  toll,
  onSelectToll,
}: {
  toll: TollPlazaRecord
  onSelectToll: (toll: TollPlazaRecord) => void
}) {
  const handleClick = useCallback(
    (event: L.LeafletMouseEvent) => {
      L.DomEvent.stop(event.originalEvent)
      onSelectToll(toll)
    },
    [onSelectToll, toll],
  )

  return (
    <Marker
      position={[toll.lat, toll.lng]}
      icon={createTollPlazaIcon(toll.code || 'TOLL')}
      bubblingMouseEvents={false}
      eventHandlers={{ click: handleClick }}
    >
      <Popup closeButton={false} className="rw-toll-popup">
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-[var(--rw-text-primary)]">{toll.name}</p>
          {toll.nhNumber ? <p>NH {toll.nhNumber}</p> : null}
          {toll.state ? <p>{toll.state}</p> : null}
        </div>
      </Popup>
    </Marker>
  )
})

const TollLayerContent = memo(function TollLayerContent({
  onSelectToll,
}: {
  onSelectToll: (toll: TollPlazaRecord) => void
}) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  const [tolls, setTolls] = useState<TollPlazaRecord[]>([])

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    let cancelled = false
    void import('../../data/tollPlazas').then((module) => {
      if (!cancelled) setTolls(module.tollPlazaRecords)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const summaryMarker = useMemo(
    () => (
      <Marker
        position={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
        icon={createTollClusterSummaryIcon(tolls.length)}
        eventHandlers={{
          click: () => {
            map.setView([INDIA_CENTER.lat, INDIA_CENTER.lng], TOLL_DETAIL_ZOOM)
          },
        }}
      >
        <Popup closeButton={false}>
          <p className="text-xs font-medium">
            {tolls.length.toLocaleString('en-IN')} toll plazas — zoom in to view markers
          </p>
        </Popup>
      </Marker>
    ),
    [map, tolls.length],
  )

  if (tolls.length === 0) return null

  if (zoom < TOLL_DETAIL_ZOOM) {
    return summaryMarker
  }

  return (
    <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={9} maxClusterRadius={48}>
      {tolls.map((toll) => (
        <TollMarker key={toll.id} toll={toll} onSelectToll={onSelectToll} />
      ))}
    </MarkerClusterGroup>
  )
})

/** Toll plazas only — loaded when layer is enabled; clustered below zoom 8. */
export const MapGeoLayers = memo(function MapGeoLayers({
  showTolls = false,
  onSelectToll,
}: MapGeoLayersProps) {
  if (!showTolls) return null
  return <TollLayerContent onSelectToll={onSelectToll} />
})
