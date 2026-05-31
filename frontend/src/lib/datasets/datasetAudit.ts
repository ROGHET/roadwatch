import { accidentRecords, bmcRoadBudgetRecords, crifBudgetRecords, gujaratRoadWorkRecords, roadWorkRecords, tamilNaduHighways, tenderComplianceRecords } from '../../data/realDatasets'
import { mockComplaintRecords } from '../../data/complaints'
import { contractAwardRecords } from '../../data/contractAwards'
import { tollPlazaRecords } from '../../data/tollPlazas'
import { isWithinIndia } from '../gis/indiaBounds'

export type DatasetAuditRow = {
  dataset: string
  rows: number
  loaded: boolean
  used: string
  uiLocation: string
  errors: string[]
}

function auditRow(
  dataset: string,
  rows: number,
  used: string,
  uiLocation: string,
  errors: string[] = [],
): DatasetAuditRow {
  return {
    dataset,
    rows,
    loaded: rows > 0 && errors.length === 0,
    used,
    uiLocation,
    errors,
  }
}

export function runDatasetAudit(): DatasetAuditRow[] {
  const tollOutside = tollPlazaRecords.filter((t) => !isWithinIndia(t.lat, t.lng)).length

  return [
    auditRow('ADSI_Table_1A.2.csv', accidentRecords.length, 'Risk engine, accident charts', 'Dashboard, Home health'),
    auditRow('roadwatch_bmc_4010.json', bmcRoadBudgetRecords.length, 'BMC budget metrics', 'Dashboard budget cards'),
    auditRow('RS_Session_259_AU_1686_B_to_D.csv', crifBudgetRecords.length, 'CRIF budget trend', 'Dashboard line chart'),
    auditRow('RS_Session_267_AU_3631_A.1.csv', roadWorkRecords.length, 'Infrastructure reports, map markers', 'Dashboard, Map complaints'),
    auditRow('RS_Session_258_AU_92_A.iii_.csv', gujaratRoadWorkRecords.length, 'Gujarat road works', 'Map complaints'),
    auditRow('RS_Session_267_AU_546_A_to_B_i.csv', tenderComplianceRecords.length, 'Tender compliance chart', 'Dashboard'),
    auditRow('hways_statehighways_0.csv', tamilNaduHighways.length, 'Highway inventory', 'Road type detection'),
    auditRow('tolls-latest.json', tollPlazaRecords.length, 'Toll map + analytics', 'Map, Dashboard', tollOutside > 0 ? [`${tollOutside} plazas filtered (invalid coords)`] : []),
    auditRow(
      'contract_awards_*.csv',
      contractAwardRecords.length,
      'Contractor charts',
      'Dashboard',
    ),
    auditRow(
      'infrastructureReports (derived)',
      mockComplaintRecords.length,
      'Complaint/issue charts',
      'Dashboard, Map',
    ),
  ]
}

export function logDatasetAudit() {
  const rows = runDatasetAudit()
  console.group('[CrashZero] Dataset audit')
  for (const row of rows) {
    const status = row.loaded ? 'OK' : 'FAILED'
    console.log(
      `${status} ${row.dataset}: rows=${row.rows} | UI: ${row.uiLocation}${row.errors.length ? ` | ${row.errors.join('; ')}` : ''}`,
    )
  }
  console.groupEnd()
  return rows
}
