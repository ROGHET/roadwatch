import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { GeoJSON, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, LineString, MultiLineString } from 'geojson'
import MarkerClusterGroup from 'react-leaflet-cluster'
import {
  geoRoadToMockRoad,
  getGeoRoadFeaturesSnapshot,
  loadGeoRoadFeatures,
  subscribeGeoRoadFeatures,
  type GeoRoadFeature,
} from '../../lib/gis/geoRoadIndex'
import { getMergedRoadCollection } from '../../lib/gis/roadDatasetManager'
import type { MockRoad } from '../../data/roads'
import type { TollPlazaRecord } from '../../data/tollPlazas'
import { tollPlazaRecords } from '../../data/tollPlazas'
import { createTollPlazaIcon } from '../../lib/map/icons'
import { fetchExtendedWeatherIntelligence, toWeatherRiskInput } from '../../lib/map/weatherIntelligence'

const roadStyle = {
  color: '#38bdf8',
  weight: 2,
  opacity: 0.65,
}

const tollClusterProps = {
  chunkedLoading: true,
  showCoverageOnHover: false,
  disableClusteringAtZoom: 13,
  maxClusterRadius: 48,
  spiderfyOnMaxZoom: true,
} as const

export type MapGeoLayersProps = {
  showRoads?: boolean
  showTolls?: boolean
  onSelectRoad: (road: MockRoad) => void
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
      icon={createTollPlazaIcon()}
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

export const MapGeoLayers = memo(function MapGeoLayers({
  showRoads = true,
  showTolls = true,
  onSelectRoad,
  onSelectToll,
}: MapGeoLayersProps) {
  const [roadCollection, setRoadCollection] = useState(() => getMergedRoadCollection())
  const [geoFeatures, setGeoFeatures] = useState<GeoRoadFeature[]>([])

  useEffect(() => {
    const refresh = () => {
      setRoadCollection(getMergedRoadCollection())
      setGeoFeatures(getGeoRoadFeaturesSnapshot())
    }
    void loadGeoRoadFeatures().then(refresh)
    return subscribeGeoRoadFeatures(refresh)
  }, [])

  const geoFeatureByOsmId = useMemo(() => {
    const map = new Map<string, GeoRoadFeature>()
    for (const feature of geoFeatures) {
      map.set(feature.osmId, feature)
    }
    return map
  }, [geoFeatures])

  const handleRoadClick = useCallback(
    async (feature: Feature<LineString | MultiLineString>, index: number) => {
      const props = feature.properties as { '@id'?: string }
      const match =
        (props['@id'] ? geoFeatureByOsmId.get(props['@id']) : undefined) ??
        geoFeatures[index] ??
        null
      if (!match) return
      const intel = await fetchExtendedWeatherIntelligence({
        lat: match.centroid.lat,
        lng: match.centroid.lng,
      })
      onSelectRoad(geoRoadToMockRoad(match, { weather: toWeatherRiskInput(intel) }))
    },
    [geoFeatureByOsmId, geoFeatures, onSelectRoad],
  )

  const roadLayer = useMemo(() => {
    if (!roadCollection.features.length || !showRoads) return null
    return (
      <GeoJSON
        key={`road-network-${roadCollection.features.length}`}
        data={roadCollection}
        style={() => roadStyle}
        onEachFeature={(feature, layer) => {
          const props = feature.properties as { name?: string }
          layer.bindTooltip(props?.name ?? 'Road segment', { sticky: true })
          const index = roadCollection.features.indexOf(feature)
          layer.on('click', () => {
            void handleRoadClick(feature as Feature<LineString | MultiLineString>, index)
          })
        }}
      />
    )
  }, [handleRoadClick, roadCollection, showRoads])

  const tollMarkers = useMemo(
    () => tollPlazaRecords.map((toll) => <TollMarker key={toll.id} toll={toll} onSelectToll={onSelectToll} />),
    [onSelectToll],
  )

  return (
    <>
      {roadLayer}
      {showTolls ? <MarkerClusterGroup {...tollClusterProps}>{tollMarkers}</MarkerClusterGroup> : null}
    </>
  )
})
