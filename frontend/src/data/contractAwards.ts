import contractCsv from '../../../datasets/contract_awards_in_investment_project_financing_with_indian_suppliers_05-31-2026.csv?raw'
import contractMetadata from '../../../datasets/metadata_contract_awards_in_investment_project_financing_since_fy_2020_05-31-2026.json'

export type ContractAwardRecord = {
  id: string
  supplier: string
  contractor: string
  project: string
  projectId: string
  awardValueUsd: number
  procurementMethod: string
  procurementCategory: string
  contractDescription: string
  signingDate: string
  fiscalYear: string
  region: string
  isRoadRelated: boolean
}

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

function parseNumber(value: string | undefined): number {
  if (!value) return 0
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function isRoadRelatedText(value: string): boolean {
  const normalized = value.toLowerCase()
  return (
    /\broad\b/.test(normalized) ||
    /\bhighway\b/.test(normalized) ||
    /\bnh[-\s]?\d+/i.test(value) ||
    /\bsh[-\s]?\d+/i.test(value) ||
    normalized.includes('bridge') ||
    normalized.includes('pavement') ||
    normalized.includes('corridor')
  )
}

const rows = parseCsv(contractCsv)
const header = rows[0] ?? []
const indexOf = (name: string) => header.indexOf(name)

const col = {
  description: indexOf('Contract Description'),
  signingDate: indexOf('Contract Signing Date'),
  fiscalYear: indexOf('Fiscal Year'),
  procurementCategory: indexOf('Procurement Category'),
  procurementMethod: indexOf('Procurement Method'),
  projectId: indexOf('Project ID'),
  projectName: indexOf('Project Name'),
  region: indexOf('Region'),
  supplier: indexOf('Supplier'),
  awardValue: indexOf('Supplier Contract Amount (USD)'),
  wbContract: indexOf('WB Contract Number'),
}

export const contractAwardRecords: ContractAwardRecord[] = rows.slice(1).map((row, index) => {
  const description = row[col.description] ?? ''
  const project = row[col.projectName] ?? ''
  const supplier = row[col.supplier] ?? 'Unknown supplier'
  return {
    id: row[col.wbContract] || `contract-${index + 1}`,
    supplier,
    contractor: supplier,
    project,
    projectId: row[col.projectId] ?? '',
    awardValueUsd: parseNumber(row[col.awardValue]),
    procurementMethod: row[col.procurementMethod] ?? 'Unknown',
    procurementCategory: row[col.procurementCategory] ?? 'Unknown',
    contractDescription: description,
    signingDate: row[col.signingDate] ?? '',
    fiscalYear: row[col.fiscalYear] ?? '',
    region: row[col.region] ?? '',
    isRoadRelated: isRoadRelatedText(`${description} ${project}`),
  }
})

export const roadContractAwards = contractAwardRecords.filter((row) => row.isRoadRelated)

export const contractAwardMetadata = contractMetadata

export function getTopContractorsByValue(limit = 10) {
  const totals = new Map<string, { contractor: string; value: number; projects: number }>()
  for (const row of contractAwardRecords) {
    const key = row.contractor
    const current = totals.get(key) ?? { contractor: key, value: 0, projects: 0 }
    current.value += row.awardValueUsd
    current.projects += 1
    totals.set(key, current)
  }
  return Array.from(totals.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function extractRoadTokens(label: string): string[] {
  const normalized = label.toLowerCase()
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter(
      (token) =>
        token.length > 2 &&
        !['road', 'marg', 'street', 'highway', 'lane', 'east', 'west', 'north', 'south'].includes(token),
    )
  const nhMatch = normalized.match(/\bnh[-\s]?(\d{1,4})\b/i)
  const shMatch = normalized.match(/\bsh[-\s]?(\d{1,4})\b/i)
  if (nhMatch) tokens.push(`nh${nhMatch[1]}`, `nh-${nhMatch[1]}`, `national highway ${nhMatch[1]}`)
  if (shMatch) tokens.push(`sh${shMatch[1]}`, `state highway ${shMatch[1]}`)
  return Array.from(new Set(tokens))
}

function normalizeRoadLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\b(marg|road|rd|street|st|highway|corridor|nh|sh|mdr|odr)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const localRoadContractorRecords: ContractAwardRecord[] = [
  {
    id: 'mumbai-lbs-kuwar-construction',
    supplier: 'KUWAR CONSTRUCTION',
    contractor: 'KUWAR CONSTRUCTION',
    project: 'Mumbai municipal road maintenance mapping',
    projectId: 'MUMBAI-ROAD-MAPPING',
    awardValueUsd: 0,
    procurementMethod: 'Municipal road contractor mapping',
    procurementCategory: 'Works',
    contractDescription: 'Lal Bahadur Shastri Marg / Shastri Road corridor maintenance contractor mapping',
    signingDate: '',
    fiscalYear: '2025-26',
    region: 'Mumbai, Maharashtra',
    isRoadRelated: true,
  },
]

const searchableRoadContractAwards = [...localRoadContractorRecords, ...roadContractAwards]

export const contractorByRoadName = new Map<string, ContractAwardRecord[]>()

function addContractAlias(alias: string, row: ContractAwardRecord): void {
  const key = normalizeRoadLabel(alias)
  if (!key) return
  const current = contractorByRoadName.get(key) ?? []
  if (!current.some((entry) => entry.id === row.id)) {
    contractorByRoadName.set(key, [...current, row])
  }
}

function indexContract(row: ContractAwardRecord): void {
  const text = `${row.contractDescription} ${row.project} ${row.region}`
  addContractAlias(text, row)
  const parts = text.split(/[\/,;:()]+/)
  for (const part of parts) {
    addContractAlias(part, row)
  }

  const normalizedText = text.toLowerCase()
  const stateAliases = ['maharashtra', 'madhya pradesh', 'gujarat', 'karnataka', 'tamil nadu', 'delhi', 'rajasthan']
  for (const state of stateAliases) {
    if (normalizedText.includes(state)) addContractAlias(state, row)
  }
  if (/\bspiu-mp\b|\brrd-mp\b|\bmp[-\s]\d+|\bbhopal\b/.test(normalizedText)) {
    addContractAlias('madhya pradesh', row)
    addContractAlias('mp', row)
  }
}

for (const row of searchableRoadContractAwards) {
  indexContract(row)
}

const localContractAliases = [
  'mumbai',
  'maharashtra',
  'lal bahadur shastri',
  'lal bahadur shastri marg',
  'shastri',
  'shastri road',
]
for (const alias of localContractAliases) {
  addContractAlias(alias, localRoadContractorRecords[0])
}

export function findContractsForRoadLabel(
  label: string,
  limit = 5,
  stateHint?: string | null,
): ContractAwardRecord[] {
  const key = normalizeRoadLabel(label)
  if (!key) return []
  const nhShTokens = extractRoadTokens(label).filter((token) => /^nh[-\d]|^sh[-\d]|national highway|state highway/.test(token))
  let matches = contractorByRoadName.get(key) ?? contractorByRoadName.get(normalizeRoadLabel(stateHint ?? ''))
  if (!matches) {
    for (const token of nhShTokens) {
      matches = contractorByRoadName.get(normalizeRoadLabel(token))
      if (matches) break
    }
  }
  return matches ? matches.slice(0, limit) : []
}

export function getProcurementMethodStats() {
  const counts = new Map<string, number>()
  for (const row of contractAwardRecords) {
    counts.set(row.procurementMethod, (counts.get(row.procurementMethod) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)
}
