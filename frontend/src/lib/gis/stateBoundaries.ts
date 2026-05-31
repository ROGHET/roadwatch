import type { FeatureCollection, Geometry, Position } from 'geojson'
import { datasetUrl } from './datasetPaths'

function decimateRing(ring: Position[], step: number): Position[] {
  if (ring.length <= 4) return ring
  const simplified: Position[] = []
  for (let index = 0; index < ring.length; index += step) {
    simplified.push(ring[index])
  }
  const last = ring[ring.length - 1]
  const tail = simplified[simplified.length - 1]
  if (tail[0] !== last[0] || tail[1] !== last[1]) {
    simplified.push(last)
  }
  return simplified
}

function simplifyGeometry(geometry: Geometry, step: number): Geometry {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map((ring) => decimateRing(ring, step)),
    }
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => decimateRing(ring, step)),
      ),
    }
  }
  return geometry
}

function simplifyCollection(collection: FeatureCollection, step: number): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: simplifyGeometry(feature.geometry, step),
    })),
  }
}

let cached: FeatureCollection | null = null
let loadPromise: Promise<FeatureCollection | null> | null = null

/** Lazy-load state boundaries with coordinate decimation for map performance. */
export async function loadSimplifiedStateBoundaries(step = 12): Promise<FeatureCollection | null> {
  if (cached) return cached
  if (!loadPromise) {
    loadPromise = fetch(datasetUrl('india_state.geojson.txt'))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const text = await response.text()
        const collection = JSON.parse(text) as FeatureCollection
        cached = simplifyCollection(collection, step)
        return cached
      })
      .catch((error) => {
        console.error('[CrashZero] Dataset load failed: india_state.geojson.txt', error)
        return null
      })
  }
  return loadPromise
}
