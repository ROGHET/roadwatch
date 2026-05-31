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
import { pointToPolylineDistanceSq } from './geoMath'
import {
  getLoadedGeoRoadFeatures,
  subscribeRoadDatasetUpdates,
  type GeoRoadFeature,
} from './roadDatasetManager'

/** Max distance from tap to road centerline for road summary (km). */
export const ROAD_MATCH_MAX_KM = 0.35

export type { GeoRoadFeature } from './roadDatasetManager'

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
  maxDistanceKm = ROAD_MATCH_MAX_KM,
): GeoRoadFeature | null {
  let nearest: GeoRoadFeature | null = null
  let bestKm = Infinity
  for (const feature of features) {
    const distanceSq = pointToPolylineDistanceSq(lat, lng, feature.coordinates)
    const distanceKm = Math.sqrt(distanceSq) * 111
    if (distanceKm < bestKm) {
      bestKm = distanceKm
      nearest = feature
    }
  }
  return nearest && bestKm <= maxDistanceKm ? nearest : null
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
