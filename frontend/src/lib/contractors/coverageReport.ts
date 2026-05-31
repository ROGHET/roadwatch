import { mapRoadMarkers } from '../../data/mapMarkers'
import { findContractsForRoadLabel } from '../../data/contractAwards'

export type ContractorCoverageReport = {
  totalRoads: number
  matchedRoads: number
  unmatchedRoads: number
  matchedPercent: number
  unmatchedPercent: number
  sampleUnmatched: string[]
}

export function buildContractorCoverageReport(): ContractorCoverageReport {
  const roads = mapRoadMarkers
  let matched = 0
  const unmatchedNames: string[] = []

  for (const road of roads) {
    const matches = findContractsForRoadLabel(road.roadName)
    if (matches.length > 0) {
      matched += 1
    } else if (unmatchedNames.length < 12) {
      unmatchedNames.push(road.roadName)
    }
  }

  const total = roads.length
  const unmatched = total - matched

  return {
    totalRoads: total,
    matchedRoads: matched,
    unmatchedRoads: unmatched,
    matchedPercent: total > 0 ? Math.round((matched / total) * 100) : 0,
    unmatchedPercent: total > 0 ? Math.round((unmatched / total) * 100) : 0,
    sampleUnmatched: unmatchedNames,
  }
}

/** @deprecated Coverage reports are not logged in production builds. */
export function logContractorCoverageReport() {
  // Intentionally no-op — avoids console noise and startup work.
}
