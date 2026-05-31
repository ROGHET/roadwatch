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

export function findContractsForRoadLabel(label: string, limit = 5): ContractAwardRecord[] {
  const tokens = label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4)
  if (tokens.length === 0) return []
  return roadContractAwards
    .filter((row) => {
      const text = `${row.contractDescription} ${row.project}`.toLowerCase()
      return tokens.some((token) => text.includes(token))
    })
    .slice(0, limit)
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
