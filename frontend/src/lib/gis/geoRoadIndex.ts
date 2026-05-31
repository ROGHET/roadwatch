import type { FeatureCollection } from 'geojson'
import type { MockRoad } from '../../data/roads'
import {
  computeCompositeHealth,
  computeRoadRisk,
  type RoadRiskContext,
  type WeatherRiskInput,
} from '../analytics/riskEngine'
import type { RoadScoreTier } from '../../components/road/RoadScoreBadge'
import type { RiskLevel } from '../../components/road/RiskIndicator'
import type { RoadStatus } from '../../components/road/RoadStatusBadge'
import { distanceSquared } from './geoMath'
import {
  ensureStartupRoadDataset,
  getLoadedGeoRoadFeatures,
  subscribeRoadDatasetUpdates,
  type GeoRoadFeature,
} from './roadDatasetManager'

export type { GeoRoadFeature } from './roadDatasetManager'

let loadPromise: Promise<GeoRoadFeature[]> | null = null

export async function loadGeoRoadFeatures(): Promise<GeoRoadFeature[]> {
  if (loadPromise) return loadPromise
  loadPromise = ensureStartupRoadDataset()
  return loadPromise
}

export function getGeoRoadFeaturesSnapshot(): GeoRoadFeature[] {
  return getLoadedGeoRoadFeatures()
}

export function subscribeGeoRoadFeatures(listener: () => void): () => void {
  return subscribeRoadDatasetUpdates(listener)
}

export function findNearestGeoRoad(
  features: GeoRoadFeature[],
  lat: number,
  lng: number,
  maxDistanceSq = 0.0008,
): GeoRoadFeature | null {
  let nearest: GeoRoadFeature | null = null
  let best = Infinity
  for (const feature of features) {
    const distance = distanceSquared(lat, lng, feature.centroid.lat, feature.centroid.lng)
    if (distance < best) {
      best = distance
      nearest = feature
    }
  }
  return nearest && best <= maxDistanceSq ? nearest : null
}

export function geoRoadToMockRoad(
  feature: GeoRoadFeature,
  context: RoadRiskContext = {},
): MockRoad {
  const health = computeCompositeHealth({
    ...context,
    highwayType: feature.roadType,
  })
  const risk = computeRoadRisk({
    ...context,
    highwayType: feature.roadType,
  })

  const status: RoadStatus =
    health.tier === 'critical' || health.tier === 'poor'
      ? 'under_repair'
      : health.tier === 'fair'
        ? 'open'
        : 'open'

  const scoreTier: RoadScoreTier =
    health.tier === 'critical' ? 'poor' : (health.tier as RoadScoreTier)

  return {
    id: feature.id,
    city: context.city ?? 'Maharashtra',
    lat: feature.centroid.lat,
    lng: feature.centroid.lng,
    roadName: feature.name,
    roadType: feature.roadType,
    score: health.score,
    scoreTier,
    status,
    riskLevel: risk.level as RiskLevel,
    authority: feature.roadType === 'NH' ? 'NHAI' : feature.roadType === 'SH' ? 'State PWD' : 'Municipal',
    budgetProgram: 'CRIF / BMC / TN Road Works',
  }
}

export function buildRoadFromCoordinates(
  features: GeoRoadFeature[],
  lat: number,
  lng: number,
  weather?: WeatherRiskInput,
): MockRoad | null {
  const nearest = findNearestGeoRoad(features, lat, lng)
  if (!nearest) return null
  return geoRoadToMockRoad(nearest, { weather })
}

export type { FeatureCollection }
