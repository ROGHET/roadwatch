import adsiCsv from '../../../datasets/ADSI_Table_1A.2.csv?raw'
import highwaysCsv from '../../../datasets/hways_statehighways_0.csv?raw'
import crifCsv from '../../../datasets/RS_Session_259_AU_1686_B_to_D.csv?raw'
import roadWorksCsv from '../../../datasets/RS_Session_267_AU_3631_A.1.csv?raw'
import tenderComplianceCsv from '../../../datasets/RS_Session_267_AU_546_A_to_B_i.csv?raw'
import bmcBudgetJson from '../../../datasets/roadwatch_bmc_4010.json?raw'
import gujaratRoadWorksCsv from '../../../datasets/RS_Session_258_AU_92_A.iii_.csv?raw'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(field.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function parseNumber(value: string | undefined): number | null {
  if (!value || /^na$/i.test(value)) return null
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export type AccidentDatasetRecord = {
  id: string
  stateOrCity: string
  roadAccidents: number
  injured: number
  deaths: number
}

export const accidentRecords: AccidentDatasetRecord[] = parseCsv(adsiCsv)
  .slice(1)
  .filter((row) => row[1] && !row[1].toLowerCase().startsWith('total'))
  .map((row) => ({
    id: slugify(row[1]),
    stateOrCity: row[1],
    roadAccidents: parseNumber(row[2]) ?? 0,
    injured: parseNumber(row[3]) ?? 0,
    deaths: parseNumber(row[4]) ?? 0,
  }))

export type TamilNaduHighwayRecord = {
  id: string
  highwayId: string
  name: string
  startKm: number | null
  endKm: number | null
  lengthKm: number | null
  roadType: 'SH'
}

export const tamilNaduHighways: TamilNaduHighwayRecord[] = parseCsv(highwaysCsv)
  .slice(1)
  .filter((row) => row[0] && row[1])
  .map((row, index) => ({
    id: `${slugify(row[0])}-${index}`,
    highwayId: row[0],
    name: row[1],
    startKm: parseNumber(row[2]),
    endKm: parseNumber(row[3]),
    lengthKm: parseNumber(row[4]),
    roadType: 'SH',
  }))

export type CrifBudgetRecord = {
  year: string
  sanctionedCrore: number
  releasedCrore: number
  spentCrore: null
  remainingCrore: number
}

const crifRows = parseCsv(crifCsv)
const crifHeader = crifRows[0] ?? []
const crifValues = crifRows[1] ?? []

export const crifBudgetRecords: CrifBudgetRecord[] = crifHeader
  .map((heading, index) => ({ heading, index }))
  .filter(({ heading }) => heading.includes('Accrual'))
  .map(({ heading, index }) => {
    const year = heading.split(' - ')[0].trim()
    const releaseIndex = crifHeader.findIndex((candidate) => candidate.startsWith(year) && candidate.includes('Release'))
    const sanctionedCrore = parseNumber(crifValues[index]) ?? 0
    const releasedCrore = parseNumber(crifValues[releaseIndex]) ?? 0
    return {
      year,
      sanctionedCrore,
      releasedCrore,
      spentCrore: null,
      remainingCrore: Math.max(0, Number((sanctionedCrore - releasedCrore).toFixed(2))),
    }
  })

export type RoadWorkRecord = {
  id: string
  district: string
  category: string
  name: string
  lengthKm: number | null
  costCrore: number | null
}

export const roadWorkRecords: RoadWorkRecord[] = parseCsv(roadWorksCsv)
  .slice(1)
  .filter((row) => row[1] && row[3])
  .map((row, index) => ({
    id: `road-work-${index + 1}`,
    district: row[1],
    category: row[2],
    name: row[3],
    lengthKm: parseNumber(row[4]),
    costCrore: parseNumber(row[5]),
  }))

export type TenderComplianceRecord = {
  id: string
  ministry: string
  tendersEvaluated: number
  nonCompliantTenders: number
  complianceReportsReceived: number
}

export const tenderComplianceRecords: TenderComplianceRecord[] = parseCsv(tenderComplianceCsv)
  .slice(1)
  .filter((row) => row[1])
  .map((row, index) => ({
    id: `tender-${index + 1}`,
    ministry: row[1],
    tendersEvaluated: parseNumber(row[2]) ?? 0,
    nonCompliantTenders: parseNumber(row[3]) ?? 0,
    complianceReportsReceived: parseNumber(row[4]) ?? 0,
  }))

type BmcBudgetDocument = {
  pages?: Array<{ text?: string }>
}

const bmcBudgetDocument = JSON.parse(bmcBudgetJson) as BmcBudgetDocument
const bmcBudgetText = bmcBudgetDocument.pages?.map((page) => page.text ?? '').join('\n') ?? ''
const bmcRoadsMatch = bmcBudgetText.match(/Roads \[\*44\]\s+(\d+)\s+[\d.]+%\s+(\d+)\s+[\d.]+%/)
const bmcRoadsFundCenterMatch = bmcBudgetText.match(/A WARD - ROADS\s+(\d+)/)

export type BmcRoadBudgetRecord = {
  id: string
  ward: string
  department: string
  sanctionedThousand: number | null
  releasedThousand: null
  spentThousand: null
  remainingThousand: null
  revenueEstimateThousand: number | null
}

export const bmcRoadBudgetRecords: BmcRoadBudgetRecord[] = [
  {
    id: 'bmc-a-ward-roads',
    ward: 'A Ward',
    department: 'Roads & Traffic Department',
    sanctionedThousand: parseNumber(bmcRoadsMatch?.[1] ?? bmcRoadsFundCenterMatch?.[1]),
    releasedThousand: null,
    spentThousand: null,
    remainingThousand: null,
    revenueEstimateThousand: parseNumber(bmcRoadsMatch?.[2] ?? bmcRoadsFundCenterMatch?.[1]),
  },
].filter((entry) => entry.sanctionedThousand !== null || entry.revenueEstimateThousand !== null)

export type GujaratRoadWorkRecord = {
  id: string
  year: string
  name: string
  sanctionedLakh: number | null
}

export const gujaratRoadWorkRecords: GujaratRoadWorkRecord[] = parseCsv(gujaratRoadWorksCsv)
  .slice(1)
  .filter((row) => row[2])
  .map((row, index) => ({
    id: `gj-road-${index + 1}`,
    year: row[1] ?? '',
    name: row[2],
    sanctionedLakh: parseNumber(row[3]),
  }))

export function detectRoadTypeFromText(value: string): 'SH' | 'NH' | 'MDR' | 'ODR' | 'Urban Road' | null {
  const normalized = value.toLowerCase()
  if (/\bnh[-\s]?\d+/i.test(value) || normalized.includes('national highway')) return 'NH'
  if (/\bsh[-\s]?\d+/i.test(value) || normalized.includes('state highway')) return 'SH'
  if (/\bmdr\b/i.test(value) || normalized.includes('major district road')) return 'MDR'
  if (/\bodr\b/i.test(value) || normalized.includes('other district road')) return 'ODR'
  if (normalized.includes('street') || normalized.includes('municipal') || normalized.includes('ward')) return 'Urban Road'
  return tamilNaduHighways.some(
    (road) => normalized.includes(road.highwayId.toLowerCase()) || normalized.includes(road.name.toLowerCase()),
  )
    ? 'SH'
    : null
}
