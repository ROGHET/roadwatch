import { mapRoadMarkers } from '../../data/mapMarkers'
import { findContractsForRoadLabel, roadContractAwards } from '../../data/contractAwards'

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

export function logContractorCoverageReport() {
  if (!import.meta.env.DEV) return
  const report = buildContractorCoverageReport()
  console.info('[RoadWatch] Contractor coverage', {
    ...report,
    roadContractAwards: roadContractAwards.length,
  })
}
