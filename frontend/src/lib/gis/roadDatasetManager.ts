import type { Feature, FeatureCollection, LineString, MultiLineString } from 'geojson'
import type { LatLngBounds } from 'leaflet'
import { datasetUrl } from './datasetPaths'
import { lineCentroid } from './geoMath'
import { mapHighwayType } from '../analytics/riskEngine'

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
  /** [minLat, minLng, maxLat, maxLng] */
  bbox: [number, number, number, number]
  minZoom: number
  label: string
  sizeMb: number
}

/** Audited road GeoJSON sources — loaded on demand when the viewport intersects. */
export const ROAD_DATASET_REGIONS: RoadDatasetRegion[] = [
  {
    id: 'mumbai-export',
    filename: 'export.geojson',
    bbox: [18.5, 72.5, 19.5, 73.2],
    minZoom: 0,
    label: 'Mumbai corridor',
    sizeMb: 4.6,
  },
  {
    id: 'maharashtra',
    filename: 'Maharashtra export.geojson',
    bbox: [15.5, 72.5, 22.5, 80.5],
    minZoom: 6,
    label: 'Maharashtra',
    sizeMb: 102.4,
  },
  {
    id: 'madhya-pradesh',
    filename: 'Madhya Pradesh.geojson',
    bbox: [21.0, 74.0, 26.9, 82.1],
    minZoom: 6,
    label: 'Madhya Pradesh',
    sizeMb: 64.6,
  },
  {
    id: 'zone-a',
    filename: 'A.geojson',
    bbox: [16.0, 70.0, 30.5, 80.5],
    minZoom: 7,
    label: 'Zone A (west / central)',
    sizeMb: 187.2,
  },
  {
    id: 'zone-b',
    filename: 'B.geojson',
    bbox: [27.0, 74.0, 35.0, 80.5],
    minZoom: 7,
    label: 'Zone B (north-west)',
    sizeMb: 88.8,
  },
  {
    id: 'zone-c',
    filename: 'C.geojson',
    bbox: [17.0, 77.0, 30.5, 90.0],
    minZoom: 7,
    label: 'Zone C (east / north-east)',
    sizeMb: 139.3,
  },
  {
    id: 'zone-d',
    filename: 'D.geojson',
    bbox: [8.0, 74.0, 18.0, 80.5],
    minZoom: 7,
    label: 'Zone D (south)',
    sizeMb: 131.6,
  },
  {
    id: 'zone-e',
    filename: 'E.geojson',
    bbox: [8.0, 74.5, 28.5, 96.0],
    minZoom: 7,
    label: 'Zone E (south / east span)',
    sizeMb: 90.6,
  },
  {
    id: 'zone-f',
    filename: 'F.geojson',
    bbox: [12.5, 76.5, 20.0, 85.0],
    minZoom: 7,
    label: 'Zone F (south-central)',
    sizeMb: 112.4,
  },
]

type RoadGeoProperties = {
  '@id'?: string
  highway?: string
  name?: string
  'name:hi'?: string
  'name:mr'?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
  const centroid = lineCentroid(primary)
  if (!centroid) return null

  const name = props.name?.trim() || props['name:hi']?.trim() || `Road segment ${index + 1}`
  const highway = props.highway ?? 'unclassified'
  const osmId = props['@id'] ?? `${regionId}-segment-${index}`
  const id = slugify(`${osmId}-${name}-${regionId}`)

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const [lng, lat] of primary) {
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
    coordinates: primary,
    centroid,
    bbox: [minLat, minLng, maxLat, maxLng],
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

const loadedRegionIds = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()
const featureById = new Map<string, GeoRoadFeature>()
const geoJsonFeatures: Feature[] = []
let mergedCollection: FeatureCollection = { type: 'FeatureCollection', features: [] }
const listeners = new Set<() => void>()

function notifyListeners() {
  for (const listener of listeners) {
    listener()
  }
}

function mergeCollection(features: Feature[]) {
  geoJsonFeatures.push(...features)
  mergedCollection = { type: 'FeatureCollection', features: geoJsonFeatures }
}

async function loadRegion(region: RoadDatasetRegion): Promise<void> {
  if (loadedRegionIds.has(region.id)) return
  const existing = loadingPromises.get(region.id)
  if (existing) return existing

  const promise = fetch(datasetUrl(region.filename))
    .then(async (response) => {
      if (!response.ok) throw new Error(`Failed to load ${region.filename}`)
      const collection = (await response.json()) as FeatureCollection
      const parsed: GeoRoadFeature[] = []
      for (let index = 0; index < collection.features.length; index += 1) {
        const feature = collection.features[index] as Feature<LineString | MultiLineString>
        const parsedFeature = toGeoRoadFeature(feature, index, region.id)
        if (!parsedFeature || featureById.has(parsedFeature.id)) continue
        featureById.set(parsedFeature.id, parsedFeature)
        parsed.push(parsedFeature)
      }
      mergeCollection(collection.features)
      loadedRegionIds.add(region.id)
      notifyListeners()
      return parsed
    })
    .catch((error) => {
      console.warn(`[RoadWatch] Road dataset unavailable: ${region.filename}`, error)
    })
    .finally(() => {
      loadingPromises.delete(region.id)
    })
    .then(() => undefined)

  loadingPromises.set(region.id, promise)
  return promise
}

export function subscribeRoadDatasetUpdates(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMergedRoadCollection(): FeatureCollection {
  return mergedCollection
}

export function getLoadedGeoRoadFeatures(): GeoRoadFeature[] {
  return Array.from(featureById.values())
}

export function getLoadedRegionIds(): string[] {
  return Array.from(loadedRegionIds)
}

export async function ensureStartupRoadDataset(): Promise<GeoRoadFeature[]> {
  const startup = ROAD_DATASET_REGIONS.find((region) => region.id === 'mumbai-export')
  if (!startup) return []
  await loadRegion(startup)
  return getLoadedGeoRoadFeatures()
}

export async function ensureRoadDatasetsForViewport(
  bounds: LatLngBounds,
  zoom: number,
): Promise<void> {
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

  if (candidates.length === 0) return

  // Load one regional file at a time to avoid memory spikes.
  for (const region of candidates) {
    await loadRegion(region)
  }
}
