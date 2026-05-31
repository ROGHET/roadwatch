import type { Feature, FeatureCollection, LineString, MultiLineString } from 'geojson'
import type { LatLngBounds } from 'leaflet'
import { datasetUrl } from './datasetPaths'
import { lineCentroid } from './geoMath'
import { mapHighwayType } from '../analytics/riskEngine'

export const MIN_ROAD_RENDER_ZOOM = 10
export const MAX_VISIBLE_ROAD_FEATURES = 2000
const SIMPLIFY_MAX_POINTS = 14
const PICK_GRID_DEGREES = 0.05

export type GeoRoadFeature = {
  id: string
  osmId: string
  name: string
  highway: string
  roadType: string
  coordinates: number[][]
  centroid: { lat: number; lng: number }
  bbox: [number, number, number, number]
}

export type RoadDatasetRegion = {
  id: string
  filename: string
  aliases: string[]
  bbox: [number, number, number, number]
  minZoom: number
  label: string
  sizeMb: number
}

export const ROAD_DATASET_REGIONS: RoadDatasetRegion[] = [
  {
    id: 'mumbai-export',
    filename: 'export.geojson',
    aliases: ['Mumbai.geojson', 'export.geojson'],
    bbox: [18.5, 72.5, 19.5, 73.2],
    minZoom: MIN_ROAD_RENDER_ZOOM,
    label: 'Mumbai corridor',
    sizeMb: 4.6,
  },
  {
    id: 'madhya-pradesh',
    filename: 'Madhya Pradesh.geojson',
    aliases: ['MadhyaPradesh.geojson', 'Madhya Pradesh.geojson'],
    bbox: [21.0, 74.0, 26.9, 82.1],
    minZoom: MIN_ROAD_RENDER_ZOOM,
    label: 'Madhya Pradesh',
    sizeMb: 64.6,
  },
  {
    id: 'zone-b',
    filename: 'B.geojson',
    aliases: ['B.geojson'],
    bbox: [27.0, 74.0, 35.0, 80.5],
    minZoom: MIN_ROAD_RENDER_ZOOM,
    label: 'Zone B',
    sizeMb: 88.8,
  },
  {
    id: 'zone-c',
    filename: 'C.geojson',
    aliases: ['C.geojson'],
    bbox: [17.0, 77.0, 30.5, 90.0],
    minZoom: MIN_ROAD_RENDER_ZOOM,
    label: 'Zone C',
    sizeMb: 139.3,
  },
  {
    id: 'zone-d',
    filename: 'D.geojson',
    aliases: ['D.geojson'],
    bbox: [8.0, 74.0, 18.0, 80.5],
    minZoom: MIN_ROAD_RENDER_ZOOM,
    label: 'Zone D',
    sizeMb: 131.6,
  },
]

type RoadGeoProperties = {
  '@id'?: string
  highway?: string
  name?: string
  'name:hi'?: string
  'name:mr'?: string
  _rwBBox?: [number, number, number, number]
}

const loadedRegionIds = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()
const featureById = new Map<string, GeoRoadFeature>()
const pickFeatureIdsByCell = new Map<string, Set<string>>()
const regionRenderFeatures = new Map<string, Feature<LineString | MultiLineString>[]>()
const listeners = new Set<() => void>()

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function scheduleIdle(task: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => task(), { timeout: 2500 })
  } else {
    setTimeout(task, 0)
  }
}

function simplifyCoordinates(coordinates: number[][]): number[][] {
  if (coordinates.length <= SIMPLIFY_MAX_POINTS) return coordinates
  const step = Math.ceil(coordinates.length / SIMPLIFY_MAX_POINTS)
  const simplified: number[][] = []
  for (let index = 0; index < coordinates.length; index += step) {
    simplified.push(coordinates[index])
  }
  const last = coordinates[coordinates.length - 1]
  const tail = simplified[simplified.length - 1]
  if (!tail || tail[0] !== last[0] || tail[1] !== last[1]) {
    simplified.push(last)
  }
  return simplified
}

function extractLines(geometry: LineString | MultiLineString): number[][][] {
  if (geometry.type === 'LineString') return [geometry.coordinates]
  return geometry.coordinates
}

function toGeoRoadFeature(
  feature: Feature<LineString | MultiLineString>,
  index: number,
  regionId: string,
): GeoRoadFeature | null {
  const props = (feature.properties ?? {}) as RoadGeoProperties
  const lines = extractLines(feature.geometry)
  const primary = lines[0]
  if (!primary || primary.length < 2) return null
  const simplified = simplifyCoordinates(primary)
  const centroid = lineCentroid(simplified)
  if (!centroid) return null

  const name = props.name?.trim() || props['name:hi']?.trim() || `Road segment ${index + 1}`
  const highway = props.highway ?? 'unclassified'
  const osmId = props['@id'] ?? `${regionId}-segment-${index}`
  const id = slugify(`${osmId}-${name}-${regionId}`)

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const [lng, lat] of simplified) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return {
    id,
    osmId,
    name,
    highway,
    roadType: mapHighwayType(highway),
    coordinates: simplified,
    centroid,
    bbox: [minLat, minLng, maxLat, maxLng],
  }
}

function toRenderFeature(
  source: Feature<LineString | MultiLineString>,
  parsed: GeoRoadFeature,
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      ...(source.properties as Record<string, unknown>),
      '@id': parsed.osmId,
      name: parsed.name,
      _rwBBox: parsed.bbox,
    },
    geometry: {
      type: 'LineString',
      coordinates: parsed.coordinates,
    },
  }
}

function bboxIntersectsViewport(
  bbox: [number, number, number, number],
  south: number,
  west: number,
  north: number,
  east: number,
): boolean {
  const [minLat, minLng, maxLat, maxLng] = bbox
  return !(maxLat < south || minLat > north || maxLng < west || minLng > east)
}

function pickCellCoord(value: number): number {
  return Math.floor(value / PICK_GRID_DEGREES)
}

function pickCellKey(latCell: number, lngCell: number): string {
  return `${latCell}:${lngCell}`
}

function indexFeatureForPick(feature: GeoRoadFeature): void {
  const [minLat, minLng, maxLat, maxLng] = feature.bbox
  const southCell = pickCellCoord(minLat)
  const northCell = pickCellCoord(maxLat)
  const westCell = pickCellCoord(minLng)
  const eastCell = pickCellCoord(maxLng)

  for (let latCell = southCell; latCell <= northCell; latCell += 1) {
    for (let lngCell = westCell; lngCell <= eastCell; lngCell += 1) {
      const key = pickCellKey(latCell, lngCell)
      const ids = pickFeatureIdsByCell.get(key) ?? new Set<string>()
      ids.add(feature.id)
      pickFeatureIdsByCell.set(key, ids)
    }
  }
}

function notifyListeners() {
  for (const listener of listeners) {
    listener()
  }
}

async function fetchRegionCollection(region: RoadDatasetRegion): Promise<FeatureCollection> {
  const filenames = Array.from(new Set([region.filename, ...region.aliases]))
  let lastError: unknown

  for (const filename of filenames) {
    try {
      const response = await fetch(datasetUrl(filename))
      if (!response.ok) {
        lastError = new Error(`Failed to load ${filename}`)
        continue
      }
      return (await response.json()) as FeatureCollection
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to load ${region.filename}`)
}

async function loadRegion(region: RoadDatasetRegion): Promise<void> {
  if (loadedRegionIds.has(region.id)) return
  const existing = loadingPromises.get(region.id)
  if (existing) return existing

  const promise = new Promise<void>((resolve) => {
    scheduleIdle(() => {
      void fetchRegionCollection(region)
        .then((collection) => {
          const renderFeatures: Feature<LineString | MultiLineString>[] = []

          for (let index = 0; index < collection.features.length; index += 1) {
            const feature = collection.features[index] as Feature<LineString | MultiLineString>
            const parsedFeature = toGeoRoadFeature(feature, index, region.id)
            if (!parsedFeature || featureById.has(parsedFeature.id)) continue
            featureById.set(parsedFeature.id, parsedFeature)
            indexFeatureForPick(parsedFeature)
            renderFeatures.push(toRenderFeature(feature, parsedFeature))
          }

          regionRenderFeatures.set(region.id, renderFeatures)
          loadedRegionIds.add(region.id)
          notifyListeners()
        })
        .catch((error) => {
          console.warn('[RoadWatch roads] lazy dataset unavailable', {
            id: region.id,
            filenames: [region.filename, ...region.aliases],
            error,
          })
        })
        .finally(() => {
          loadingPromises.delete(region.id)
          resolve()
        })
    })
  })

  loadingPromises.set(region.id, promise)
  return promise
}

export function subscribeRoadDatasetUpdates(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLoadedGeoRoadFeatures(): GeoRoadFeature[] {
  return Array.from(featureById.values())
}

export function getLoadedGeoRoadFeaturesNearPoint(lat: number, lng: number): GeoRoadFeature[] {
  const latCell = pickCellCoord(lat)
  const lngCell = pickCellCoord(lng)
  const candidates = new Map<string, GeoRoadFeature>()

  for (let latOffset = -1; latOffset <= 1; latOffset += 1) {
    for (let lngOffset = -1; lngOffset <= 1; lngOffset += 1) {
      const ids = pickFeatureIdsByCell.get(pickCellKey(latCell + latOffset, lngCell + lngOffset))
      if (!ids) continue
      for (const id of ids) {
        const feature = featureById.get(id)
        if (feature) candidates.set(id, feature)
      }
    }
  }

  return Array.from(candidates.values())
}

export function getLoadedRegionIds(): string[] {
  return Array.from(loadedRegionIds)
}

export function getIndexedRoadFeatureCount(): number {
  return featureById.size
}

export function getPickIndexCellCount(): number {
  return pickFeatureIdsByCell.size
}

export function getVisibleRoadCollection(bounds: LatLngBounds, zoom: number): FeatureCollection {
  if (zoom < MIN_ROAD_RENDER_ZOOM) {
    return { type: 'FeatureCollection', features: [] }
  }

  const south = bounds.getSouth()
  const west = bounds.getWest()
  const north = bounds.getNorth()
  const east = bounds.getEast()
  const visible: Feature[] = []

  for (const features of regionRenderFeatures.values()) {
    for (const feature of features) {
      const bbox = (feature.properties as RoadGeoProperties)._rwBBox
      if (bbox && !bboxIntersectsViewport(bbox, south, west, north, east)) continue
      visible.push(feature)
      if (visible.length >= MAX_VISIBLE_ROAD_FEATURES) {
        return { type: 'FeatureCollection', features: visible }
      }
    }
  }

  return { type: 'FeatureCollection', features: visible }
}

/** @deprecated Use getVisibleRoadCollection — returns empty when below zoom threshold */
export function getMergedRoadCollection(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] }
}

export async function ensureStartupRoadDataset(): Promise<GeoRoadFeature[]> {
  const startup = ROAD_DATASET_REGIONS.find((region) => region.id === 'mumbai-export')
  if (!startup) return []
  await loadRegion(startup)
  return getLoadedGeoRoadFeatures()
}

/** Loads datasets whose bbox intersects a point (for map clicks / picks only). */
export async function ensureRoadDatasetsNearPoint(
  lat: number,
  lng: number,
  zoom: number = MIN_ROAD_RENDER_ZOOM,
): Promise<void> {
  if (zoom < MIN_ROAD_RENDER_ZOOM) return

  const pad = 0.12
  const south = lat - pad
  const north = lat + pad
  const west = lng - pad
  const east = lng + pad

  const candidates = ROAD_DATASET_REGIONS.filter(
    (region) =>
      !loadedRegionIds.has(region.id) &&
      region.minZoom <= zoom &&
      bboxIntersectsViewport(region.bbox, south, west, north, east),
  ).sort((left, right) => {
    const leftArea = (left.bbox[2] - left.bbox[0]) * (left.bbox[3] - left.bbox[1])
    const rightArea = (right.bbox[2] - right.bbox[0]) * (right.bbox[3] - right.bbox[1])
    return leftArea - rightArea
  })

  for (const region of candidates) {
    await loadRegion(region)
    if (getLoadedGeoRoadFeaturesNearPoint(lat, lng).length > 0) return
  }
}

export async function ensureRoadDatasetsForViewport(
  bounds: LatLngBounds,
  zoom: number,
): Promise<void> {
  if (zoom < MIN_ROAD_RENDER_ZOOM) return

  const south = bounds.getSouth()
  const west = bounds.getWest()
  const north = bounds.getNorth()
  const east = bounds.getEast()

  const candidates = ROAD_DATASET_REGIONS.filter(
    (region) =>
      !loadedRegionIds.has(region.id) &&
      region.minZoom <= zoom &&
      bboxIntersectsViewport(region.bbox, south, west, north, east),
  )

  for (const region of candidates) {
    await loadRegion(region)
  }
}
