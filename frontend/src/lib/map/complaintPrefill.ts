import { findContractsForRoadLabel } from '../../data/contractAwards'
import { CITIES_BY_STATE } from '../../data/indianStates'
import type { MockRoad } from '../../data/roads'
import { resolveAuthorityRouting, type RoadType } from '../complaintRouting'
import { inferPlaceFromCoordinates } from './inferPlace'
import type { LocationWeatherSnapshot } from './locationIntelligence'

export type ComplaintPrefillPayload = {
  lat: number
  lng: number
  roadId?: string
  roadName?: string
  roadType?: string
  contractor?: string
  authority?: string
  department?: string
  district?: string
  city?: string
  state?: string
  locationLabel?: string
  issueType?: string
  title?: string
}

function resolveDistrict(city: string, state: string): string | undefined {
  if (city) return city
  const cities = CITIES_BY_STATE[state]
  return cities?.[0]
}

function normalizeRoadType(value?: string): RoadType | undefined {
  if (!value) return undefined
  const normalized = value.toUpperCase()
  if (normalized === 'NH' || normalized.includes('NATIONAL')) return 'NH'
  if (normalized === 'SH' || normalized.includes('STATE')) return 'SH'
  if (normalized === 'MDR') return 'MDR'
  if (normalized.includes('URBAN')) return 'Urban Road'
  if (normalized.includes('VILLAGE')) return 'Village Road'
  if (normalized.includes('EXPRESS')) return 'Expressway'
  return 'Urban Road'
}

export function buildComplaintPrefillFromRoad(road: MockRoad): ComplaintPrefillPayload {
  const roadType = normalizeRoadType(road.roadType)
  const routing = roadType ? resolveAuthorityRouting(roadType) : undefined
  const contracts = findContractsForRoadLabel(road.roadName)
  const place = inferPlaceFromCoordinates(road.lat, road.lng)
  const city = road.city || place.city
  const state = place.state

  return {
    lat: road.lat,
    lng: road.lng,
    roadId: road.id,
    roadName: road.roadName,
    roadType: road.roadType,
    contractor: contracts[0]?.supplier,
    authority: routing?.assignedAuthority,
    department: routing?.assignedDepartment,
    district: resolveDistrict(city, state),
    city,
    state,
    locationLabel: road.roadName,
    title: road.roadName,
  }
}

export function buildComplaintPrefillFromLocation(
  lat: number,
  lng: number,
  intelligence: LocationWeatherSnapshot,
  road?: MockRoad | null,
): ComplaintPrefillPayload {
  const place = inferPlaceFromCoordinates(lat, lng)
  const city = intelligence.city || place.city
  const state = intelligence.state || place.state
  const roadType = normalizeRoadType(road?.roadType ?? intelligence.roadType)
  const routing = roadType ? resolveAuthorityRouting(roadType) : undefined
  const roadName = road?.roadName ?? intelligence.locationName
  const contracts = roadName ? findContractsForRoadLabel(roadName) : []

  return {
    lat,
    lng,
    roadId: road?.id,
    roadName,
    roadType: road?.roadType ?? intelligence.roadType,
    contractor: contracts[0]?.supplier,
    authority: routing?.assignedAuthority,
    department: routing?.assignedDepartment,
    district: resolveDistrict(city, state),
    city,
    state,
    locationLabel: intelligence.locationName,
    title: roadName ?? intelligence.locationName,
  }
}
