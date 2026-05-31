import tollsJson from '../../../datasets/tolls-latest.json'
import nhaiTollCsv from '../../../datasets/india-tollplaza-data-nhai.csv?raw'
import { datasetUrl } from '../lib/gis/datasetPaths'
import { extractTollState } from '../lib/tolls/tollState'

export type TollPlazaRecord = {
  id: string
  name: string
  code: string
  lat: number
  lng: number
  state: string | null
  nhNumber: string | null
  location: string | null
  projectType: string | null
  contractorName: string | null
  helplineCrane: string | null
  helplineAmbulance: string | null
  helplinePatrol: string | null
  emergencyServices: string | null
  nearestPoliceStation: string | null
  policeStationContact: string | null
  nearestHospitals: string | null
  inchargeName: string | null
  inchargeContact: string | null
  carSingle: string | null
  source: 'nhai-api' | 'nhai-csv'
}

type RawToll = {
  tollplaza_id?: number
  tollplaza_name?: string
  tollplaza_code?: string
  state?: string | null
  state_name?: string | null
  plaza_state?: string | null
  address?: string | null
  latitude?: string
  longitude?: string
  nh_no?: string
  location?: string
  project_type?: string
  contractor_name?: string
  helpline_crane?: string
  helpline_ambulance?: string
  helpline_patrol?: string
  emergency_services?: string
  nearest_police_station?: string
  police_station_contact?: string
  nearest_hospitals?: string
  incharge_name?: string
  incharge_contact?: string
  car_single?: string
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

function parseCoordinate(value: string | undefined): number | null {
  if (!value) return null
  const normalized = value.trim().replace(/\.{2,}/g, '.')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

const rawTolls = tollsJson as RawToll[]

const apiTolls: TollPlazaRecord[] = rawTolls.flatMap((row, index) => {
  const lat = parseCoordinate(row.latitude)
  const lng = parseCoordinate(row.longitude)
  if (lat === null || lng === null) return []
  const record: TollPlazaRecord = {
    id: `toll-${row.tollplaza_id ?? index}`,
    name: row.tollplaza_name ?? `Toll plaza ${index + 1}`,
    code: row.tollplaza_code ?? '',
    lat,
    lng,
    state: extractTollState({
      state: row.state,
      state_name: row.state_name,
      plaza_state: row.plaza_state,
      location: row.location,
      address: row.address,
      name: row.tollplaza_name,
    }),
    nhNumber: row.nh_no ?? null,
    location: row.location ?? null,
    projectType: row.project_type ?? null,
    contractorName: row.contractor_name ?? null,
    helplineCrane: row.helpline_crane ?? null,
    helplineAmbulance: row.helpline_ambulance ?? null,
    helplinePatrol: row.helpline_patrol ?? null,
    emergencyServices: row.emergency_services ?? null,
    nearestPoliceStation: row.nearest_police_station ?? null,
    policeStationContact: row.police_station_contact ?? null,
    nearestHospitals: row.nearest_hospitals ?? null,
    inchargeName: row.incharge_name ?? null,
    inchargeContact: row.incharge_contact ?? null,
    carSingle: row.car_single ?? null,
    source: 'nhai-api',
  }
  return [record]
})

export const tollPlazaRecords: TollPlazaRecord[] = [...apiTolls]

const nhaiRows = parseCsv(nhaiTollCsv).slice(1)
const existingKeys = new Set(apiTolls.map((row) => `${row.lat.toFixed(4)}:${row.lng.toFixed(4)}`))

for (const row of nhaiRows) {
  const lat = parseCoordinate(row[1])
  const lng = parseCoordinate(row[2])
  if (lat === null || lng === null) continue
  const key = `${lat.toFixed(4)}:${lng.toFixed(4)}`
  if (existingKeys.has(key)) continue
  existingKeys.add(key)
  tollPlazaRecords.push({
    id: `toll-csv-${tollPlazaRecords.length}`,
    name: row[0] ?? 'Toll plaza',
    code: '',
    lat,
    lng,
    state: extractTollState({
      location: row[0],
      address: row[0],
      name: row[0],
    }),
    nhNumber: null,
    location: row[0] ?? null,
    projectType: row[3] ?? null,
    contractorName: null,
    helplineCrane: null,
    helplineAmbulance: null,
    helplinePatrol: null,
    emergencyServices: null,
    nearestPoliceStation: null,
    policeStationContact: null,
    nearestHospitals: null,
    inchargeName: null,
    inchargeContact: null,
    carSingle: row[4] ?? null,
    source: 'nhai-csv',
  })
}

/** Hit-test for map clicks when toll layer is enabled (meters). */
export function findTollPlazaAtPoint(
  lat: number,
  lng: number,
  records: TollPlazaRecord[],
  radiusMeters = 400,
): TollPlazaRecord | null {
  let nearest: TollPlazaRecord | null = null
  let bestMeters = Infinity
  const metersPerDegLat = 111_320
  const cosLat = Math.cos((lat * Math.PI) / 180)

  for (const toll of records) {
    const dLat = (lat - toll.lat) * metersPerDegLat
    const dLng = (lng - toll.lng) * metersPerDegLat * cosLat
    const meters = Math.hypot(dLat, dLng)
    if (meters < bestMeters) {
      bestMeters = meters
      nearest = toll
    }
  }

  return nearest && bestMeters <= radiusMeters ? nearest : null
}

export function findNearestTollPlaza(lat: number, lng: number, maxKm = 25): TollPlazaRecord | null {
  let nearest: TollPlazaRecord | null = null
  let best = Infinity
  for (const toll of tollPlazaRecords) {
    const distance = (lat - toll.lat) ** 2 + (lng - toll.lng) ** 2
    if (distance < best) {
      best = distance
      nearest = toll
    }
  }
  const maxSq = (maxKm / 111) ** 2
  return nearest && best <= maxSq ? nearest : null
}

export { datasetUrl }
