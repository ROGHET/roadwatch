import { roadWorkRecords } from './realDatasets'
import gujaratWorksCsv from '../../../datasets/RS_Session_258_AU_92_A.iii_.csv?raw'
import type { MockComplaintRecord } from './complaints'
import type { RoadType } from '../lib/complaintRouting'
/** Minimal road shape for geocoding reports — avoids importing map GeoJSON modules. */
export type GeoRoadMatchFeature = {
  id: string
  name: string
  centroid: { lat: number; lng: number }
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

function parseNumber(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function matchGeoRoad(features: GeoRoadMatchFeature[], label: string): GeoRoadMatchFeature | null {
  const normalized = label.toLowerCase()
  const tokens = normalized.split(/[^a-z0-9]+/).filter((token) => token.length > 4)
  let best: GeoRoadMatchFeature | null = null
  let bestScore = 0
  for (const feature of features) {
    const name = feature.name.toLowerCase()
    let score = 0
    if (normalized.includes(name) || name.includes(normalized)) score += 5
    for (const token of tokens) {
      if (name.includes(token)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = feature
    }
  }
  return bestScore >= 3 ? best : null
}

export function attachGeoCoordinatesToReports(
  reports: MockComplaintRecord[],
  features: GeoRoadMatchFeature[],
): MockComplaintRecord[] {
  return reports
    .map((report) => {
      const match = matchGeoRoad(features, report.roadName ?? report.title)
      if (!match) return null
      return {
        ...report,
        roadId: match.id,
        lat: match.centroid.lat,
        lng: match.centroid.lng,
      }
    })
    .filter((report): report is MockComplaintRecord => Boolean(report))
}

function inferIssueType(name: string): string {
  const normalized = name.toLowerCase()
  if (normalized.includes('pothole') || normalized.includes('repair')) return 'pothole'
  if (normalized.includes('bridge')) return 'pavement damage'
  if (normalized.includes('widening') || normalized.includes('strengthening')) return 'construction delays'
  if (normalized.includes('drain') || normalized.includes('flood')) return 'drainage blockage'
  return 'construction delays'
}

function inferSeverity(costCrore: number | null): 'low' | 'medium' | 'high' | 'critical' {
  if (!costCrore) return 'medium'
  if (costCrore >= 50) return 'critical'
  if (costCrore >= 20) return 'high'
  if (costCrore >= 5) return 'medium'
  return 'low'
}

function inferRoadType(name: string): RoadType {
  const normalized = name.toLowerCase()
  if (/\bnh\b|\bnational highway\b/i.test(normalized)) return 'NH'
  if (/\bsh\b|\bstate highway\b/i.test(normalized)) return 'SH'
  return 'MDR'
}

const tnReports: MockComplaintRecord[] = roadWorkRecords.map((work, index) => {
  const issueType = inferIssueType(work.name)
  const severity = inferSeverity(work.costCrore)
  const roadType = inferRoadType(work.name)
  return {
    id: `tn-work-${work.id}`,
    roadId: slugify(work.name),
    city: work.district,
    lat: 0,
    lng: 0,
    referenceId: `TN-RW-${index + 1}`,
    roadType,
    issueType,
    assignedAuthority: 'Tamil Nadu State PWD',
    assignedDepartment: work.category,
    title: work.name,
    description: `Rajya Sabha road work package in ${work.district}. Length ${work.lengthKm ?? 'N/A'} km; sanctioned Rs ${work.costCrore ?? 'N/A'} Cr.`,
    severity,
    status: 'routed',
    reportedAt: '2025 RS Session',
    roadName: work.name,
  }
})

const gujaratRows = parseCsv(gujaratWorksCsv).slice(1)
const gujaratReports: MockComplaintRecord[] = gujaratRows
  .filter((row) => row[2])
  .map((row, index) => {
    const name = row[2]
    const costLakh = parseNumber(row[3])
    const costCrore = costLakh === null ? null : costLakh / 100
    return {
      id: `gj-work-${index + 1}`,
      roadId: slugify(name),
      city: 'Gujarat',
      lat: 0,
      lng: 0,
      referenceId: `GJ-RW-${index + 1}`,
      roadType: inferRoadType(name),
      issueType: inferIssueType(name),
      assignedAuthority: 'Gujarat State PWD',
      assignedDepartment: 'Roads and Buildings',
      title: name,
      description: `Gujarat sanctioned road work (${row[1] ?? 'FY'}). Sanctioned Rs ${costLakh ?? 'N/A'} Lakh.`,
      severity: inferSeverity(costCrore),
      status: 'in_review',
      reportedAt: row[1] ?? '2018-19',
      roadName: name,
    }
  })

/** Geocoded infrastructure pressure points derived from real parliamentary road-work datasets. */
export const infrastructureReports: MockComplaintRecord[] = [...tnReports, ...gujaratReports]
