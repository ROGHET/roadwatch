import {
  accidentRecords,
  bmcRoadBudgetRecords,
  crifBudgetRecords,
  gujaratRoadWorkRecords,
  roadWorkRecords,
  tamilNaduHighways,
  tenderComplianceRecords,
} from './realDatasets'
import { tollPlazaRecords } from './tollPlazas'
import { contractAwardRecords, roadContractAwards } from './contractAwards'

export type TnHighway = {
  id: string
  shNo: string
  name: string
  startKm: number
  endKm: number
  lengthKm: number
  state: 'Tamil Nadu'
  roadType: 'SH'
}

export type AccidentStat = {
  state: string
  roadCases: number
  roadInjured: number
  roadDeaths: number
  totalCases: number
  totalInjured: number
  totalDeaths: number
  year: number
}

export type RoadProject = {
  id: string
  district: string
  category: string
  name: string
  lengthKm: number
  costCrore: number
  state: string
  status: 'ongoing' | 'completed' | 'proposed'
}

export type CrifBudget = {
  year: string
  accrualCrore: number
  releaseCrore: number
  source: 'CRIF'
  state?: string
}

export type BmcBudget = {
  id: string
  ward: string
  fundCode: string
  workName: string
  budgetEstimate: number
  year: string
  authority: 'BMC'
}

export const tnHighways: TnHighway[] = tamilNaduHighways.map((row) => ({
  id: row.id,
  shNo: row.highwayId,
  name: row.name,
  startKm: row.startKm ?? 0,
  endKm: row.endKm ?? 0,
  lengthKm: row.lengthKm ?? 0,
  state: 'Tamil Nadu',
  roadType: 'SH',
}))

export const accidentStats: AccidentStat[] = accidentRecords.map((row) => ({
  state: row.stateOrCity,
  roadCases: row.roadAccidents,
  roadInjured: row.injured,
  roadDeaths: row.deaths,
  totalCases: row.roadAccidents,
  totalInjured: row.injured,
  totalDeaths: row.deaths,
  year: 2023,
}))

export const tnRoadProjects: RoadProject[] = roadWorkRecords.map((row) => ({
  id: row.id,
  district: row.district,
  category: row.category,
  name: row.name,
  lengthKm: row.lengthKm ?? 0,
  costCrore: row.costCrore ?? 0,
  state: 'Tamil Nadu',
  status: 'ongoing',
}))

export const crifBudgets: CrifBudget[] = crifBudgetRecords.map((row) => ({
  year: row.year,
  accrualCrore: row.sanctionedCrore,
  releaseCrore: row.releasedCrore,
  source: 'CRIF',
}))

export const bmcBudgets: BmcBudget[] = bmcRoadBudgetRecords.map((row) => ({
  id: row.id,
  ward: row.ward,
  fundCode: '4010',
  workName: row.department,
  budgetEstimate: row.sanctionedThousand ?? row.revenueEstimateThousand ?? 0,
  year: '2025-26',
  authority: 'BMC',
}))

export const datasetSummary = {
  geoRoadSegments: 5931,
  tollPlazas: tollPlazaRecords.length,
  contractAwards: contractAwardRecords.length,
  roadContracts: roadContractAwards.length,
  gujaratWorks: gujaratRoadWorkRecords.length,
  tenderMinistries: tenderComplianceRecords.length,
}

export function getAccidentStatForState(state: string): AccidentStat | undefined {
  return accidentStats.find((s) => s.state.toLowerCase() === state.toLowerCase())
}

export function getTnProjectsByDistrict(district: string): RoadProject[] {
  return tnRoadProjects.filter((p) => p.district === district)
}
