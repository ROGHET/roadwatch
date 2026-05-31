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
import { findContractsForRoadLabel } from '../../data/contractAwards'
import { getRoadBudget } from '../../data/mapRoadBudget'
import { inferPlaceFromCoordinates } from '../map/inferPlace'
import { pointToPolylineDistanceSq } from './geoMath'
import {
  getLoadedGeoRoadFeatures,
  getLoadedGeoRoadFeaturesNearPoint,
  subscribeRoadDatasetUpdates,
  type GeoRoadFeature,
} from './roadDatasetManager'

/** Max distance from tap to road centerline for road summary (km). */
export const ROAD_MATCH_MAX_KM = 0.35

export type { GeoRoadFeature } from './roadDatasetManager'

export function getGeoRoadFeaturesSnapshot(): GeoRoadFeature[] {
  return getLoadedGeoRoadFeatures()
}

export function getGeoRoadFeaturesNearPoint(lat: number, lng: number): GeoRoadFeature[] {
  return getLoadedGeoRoadFeaturesNearPoint(lat, lng)
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
  const place = inferPlaceFromCoordinates(feature.centroid.lat, feature.centroid.lng)
  const budget = getRoadBudget(feature.id, place.state, feature.name)
  const contractor = findContractsForRoadLabel(feature.name, 1, place.state)[0]?.supplier

  return {
    id: feature.id,
    city: context.city ?? place.city,
    state: context.state ?? place.state,
    lat: feature.centroid.lat,
    lng: feature.centroid.lng,
    roadName: feature.name,
    roadType: feature.roadType,
    score: health.score,
    scoreTier,
    status,
    riskLevel: risk.level as RiskLevel,
    authority: feature.roadType === 'NH' ? 'NHAI' : feature.roadType === 'SH' ? 'State PWD' : 'Municipal',
    contractor,
    budgetProgram:
      budget.sanctioned || budget.released || budget.utilized
        ? 'Linked road budget records'
        : undefined,
    budgetHistory: budget.sanctioned
      ? [
          {
            year: '2025-26',
            sanctioned: budget.sanctioned,
            spent: budget.utilized ?? budget.spent ?? budget.released ?? 'Data unavailable',
          },
        ]
      : undefined,
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
