import {
  buildRoadFromCoordinates,
  findNearestGeoRoad,
  getGeoRoadFeaturesSnapshot,
  type GeoRoadFeature,
} from './geoRoadIndex'
import { ensureRoadDatasetsNearPoint } from './roadDatasetManager'
import type { WeatherRiskInput } from '../analytics/riskEngine'
import type { MockRoad } from '../../data/roads'

/** Load regional GeoJSON only for datasets intersecting this point (map / pick flows). */
export async function ensureRoadDataNearPoint(lat: number, lng: number): Promise<GeoRoadFeature[]> {
  await ensureRoadDatasetsNearPoint(lat, lng)
  return getGeoRoadFeaturesSnapshot()
}

export function resolveRoadAtClick(
  lat: number,
  lng: number,
  weather?: WeatherRiskInput,
): MockRoad | null {
  const features = getGeoRoadFeaturesSnapshot()
  return buildRoadFromCoordinates(features, lat, lng, weather)
}

export function findNearestLoadedRoad(
  lat: number,
  lng: number,
): GeoRoadFeature | null {
  return findNearestGeoRoad(getGeoRoadFeaturesSnapshot(), lat, lng)
}
