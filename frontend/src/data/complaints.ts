import type { ComplaintCardProps } from '../components/complaints/ComplaintCard'
import type { ComplaintListItem } from '../components/complaints/ComplaintListSection'
import { resolveAuthorityRouting, type RoadType } from '../lib/complaintRouting'
import { mockRoads } from './roads'

const mockRoadTypes: RoadType[] = ['NH', 'SH', 'MDR', 'Urban Road', 'Village Road']

export type MockComplaintDetail = {
  id: string
  roadId: string
  city: string
  lat: number
  lng: number
  referenceId: string
  roadType: RoadType
  issueType: string
  assignedAuthority: string
  assignedDepartment: string
} & Omit<ComplaintCardProps, 'footer' | 'className' | 'issueType'>

export type MockComplaintRecord = MockComplaintDetail & {
  roadId: string
}

type IssueTemplate = {
  issueType: string
  title: string
  severity: ComplaintCardProps['severity']
  resolutionStatus: string
  description: (roadName: string, city: string, variant: number) => string
}

const issueTemplates: IssueTemplate[] = [
  {
    issueType: 'pothole',
    title: 'Pothole cluster',
    severity: 'high',
    resolutionStatus: 'under review',
    description: (roadName, city, variant) =>
      `Repeated potholes on ${roadName} in ${city} are forcing lane changes and causing two-wheelers to slow abruptly near junction ${variant + 1}.`,
  },
  {
    issueType: 'flooding',
    title: 'Flooding on carriageway',
    severity: 'critical',
    resolutionStatus: 'assigned',
    description: (roadName, city, variant) =>
      `Stormwater overflow is pooling across ${roadName} in ${city}, with water depth varying across ${variant + 1} low spots after heavy rain.`,
  },
  {
    issueType: 'waterlogging',
    title: 'Waterlogging after rain',
    severity: 'medium',
    resolutionStatus: 'scheduled',
    description: (roadName, city, variant) =>
      `Drainage inlet blockage on ${roadName} in ${city} is creating standing water for ${variant + 2} signal cycles during evening traffic.`,
  },
  {
    issueType: 'lighting',
    title: 'Broken streetlights',
    severity: 'low',
    resolutionStatus: 'verification in progress',
    description: (roadName, city, variant) =>
      `A ${variant + 3} segment of streetlights on ${roadName} in ${city} is intermittently failing, reducing night visibility near pedestrian crossings.`,
  },
  {
    issueType: 'congestion',
    title: 'Recurring congestion',
    severity: 'medium',
    resolutionStatus: 'routed',
    description: (roadName, city, variant) =>
      `Peak-hour congestion on ${roadName} in ${city} is backing traffic into feeder streets and delaying buses by ${variant + 4} minutes.`,
  },
  {
    issueType: 'lane blockage',
    title: 'Lane blocked by debris',
    severity: 'high',
    resolutionStatus: 'under review',
    description: (roadName, city, variant) =>
      `A partial lane blockage on ${roadName} in ${city} is narrowing the carriageway by roughly ${variant + 1} meters near a busy merge point.`,
  },
  {
    issueType: 'construction delays',
    title: 'Construction delay notice',
    severity: 'medium',
    resolutionStatus: 'assigned',
    description: (roadName, city, variant) =>
      `Utility and resurfacing work on ${roadName} in ${city} is running ${variant + 2} days behind schedule, leaving temporary diversions in place.`,
  },
  {
    issueType: 'accident-prone zone',
    title: 'Accident-prone zone',
    severity: 'critical',
    resolutionStatus: 'engineering review',
    description: (roadName, city, variant) =>
      `Crash reports around ${roadName} in ${city} continue to cluster at a blind curve and poorly timed signal phase ${variant + 1}.`,
  },
  {
    issueType: 'pavement damage',
    title: 'Pavement damage',
    severity: 'high',
    resolutionStatus: 'under review',
    description: (roadName, city) =>
      `Surface cracking and edge breaks on ${roadName} in ${city} are spanning several inspection panels and worsening with heavy vehicle turns.`,
  },
  {
    issueType: 'drainage blockage',
    title: 'Drainage blockage',
    severity: 'medium',
    resolutionStatus: 'scheduled',
    description: (roadName, city, variant) =>
      `Blocked inlets along ${roadName} in ${city} are holding runoff at ${variant + 1} drain points and spilling onto the shoulder.`,
  },
  {
    issueType: 'median damage',
    title: 'Median damage',
    severity: 'high',
    resolutionStatus: 'routed',
    description: (roadName, city, variant) =>
      `Damaged median sections on ${roadName} in ${city} have displaced protective blocks across ${variant + 1} segments of the center divider.`,
  },
  {
    issueType: 'signage failure',
    title: 'Signage failure',
    severity: 'low',
    resolutionStatus: 'rejected',
    description: (roadName, city, variant) =>
      `Directional signs on ${roadName} in ${city} are faded or missing at ${variant + 1} key decision points, confusing lane choice for drivers.`,
  },
  {
    issueType: 'encroachment',
    title: 'Encroachment on shoulder',
    severity: 'medium',
    resolutionStatus: 'under review',
    description: (roadName, city, variant) =>
      `Temporary stalls and parked vehicles are encroaching on the shoulder of ${roadName} in ${city} across ${variant + 1} access points.`,
  },
  {
    issueType: 'manhole cover',
    title: 'Loose manhole cover',
    severity: 'critical',
    resolutionStatus: 'assigned',
    description: (roadName, city, variant) =>
      `Loose utility covers on ${roadName} in ${city} are rattling and creating a hazard for two-wheelers near ${variant + 1} junctions.`,
  },
  {
    issueType: 'shoulder erosion',
    title: 'Shoulder erosion',
    severity: 'high',
    resolutionStatus: 'under review',
    description: (roadName, city, variant) =>
      `Shoulder erosion along ${roadName} in ${city} has removed support material over ${variant + 1} vulnerable stretches after repeated runoff.`,
  },
  {
    issueType: 'speed calming',
    title: 'Unsafe speed calming hump',
    severity: 'medium',
    resolutionStatus: 'scheduled',
    description: (roadName, city, variant) =>
      `A poorly graded speed calming feature on ${roadName} in ${city} is impacting suspension travel at ${variant + 1} approach points.`,
  },
  {
    issueType: 'traffic signal',
    title: 'Traffic signal malfunction',
    severity: 'medium',
    resolutionStatus: 'verification in progress',
    description: (roadName, city, variant) =>
      `Signal timing irregularities around ${roadName} in ${city} are producing stop-start queues at ${variant + 1} intersections.`,
  },
]

function formatDate(base: Date): string {
  const day = String(base.getUTCDate()).padStart(2, '0')
  const month = base.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${day} ${month} ${base.getUTCFullYear()}`
}

function offsetDate(daysAgo: number, hourOffset = 0): string {
  const date = new Date(Date.UTC(2026, 4, 29, 12, 0, 0))
  date.setUTCDate(date.getUTCDate() - daysAgo)
  date.setUTCHours(date.getUTCHours() - hourOffset)
  return formatDate(date)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatReference(index: number): string {
  return `RW-${2025 + Math.floor(index / 260)}-${String(index + 1).padStart(3, '0')}`
}

function createComplaintRecord(index: number, road: (typeof mockRoads)[number]) {
  const template = issueTemplates[index % issueTemplates.length]
  const roadType = mockRoadTypes[index % mockRoadTypes.length]
  const routing = resolveAuthorityRouting(roadType)
  const variant = Math.floor(index / issueTemplates.length)
  const latOffset = ((index % 7) - 3) * 0.0017
  const lngOffset = (((index + 3) % 7) - 3) * 0.0018
  const reportedAt = offsetDate(index % 520, variant % 4)
  const updatedAt = offsetDate(clamp((index % 520) - (variant % 5) + 1, 0, 520))
  const citizenReports = 2 + (index % 20)
  const maintenanceReports = 1 + (index % 6)

  return {
    id: `cmp-${String(index + 1).padStart(3, '0')}`,
    roadId: road.id,
    city: road.city,
    lat: Number((road.lat + latOffset).toFixed(5)),
    lng: Number((road.lng + lngOffset).toFixed(5)),
    referenceId: formatReference(index),
    roadType,
    assignedAuthority: routing.assignedAuthority,
    assignedDepartment: routing.assignedDepartment,
    title: `${template.title} near ${road.roadName}`,
    roadName: road.roadName,
    status: ['pending', 'routed', 'in_review', 'resolved', 'rejected'][index % 5] as ComplaintCardProps['status'],
    severity: template.severity,
    issueType: template.issueType,
    description: template.description(road.roadName, road.city, variant),
    reportedAt,
    updatedAt,
    resolutionStatus: template.resolutionStatus,
    citizenReports,
    maintenanceReports,
  } satisfies MockComplaintRecord
}

export const mockComplaintRecords: MockComplaintRecord[] = mockRoads.flatMap((road, roadIndex) =>
  issueTemplates.map((_, templateIndex) =>
    createComplaintRecord(roadIndex * issueTemplates.length + templateIndex, road),
  ),
)

export const mockComplaintSummaries: ComplaintListItem[] = mockComplaintRecords.map(
  ({
    id,
    lat: _lat,
    lng: _lng,
    city: _city,
    roadId: _roadId,
    description: _description,
    ...summary
  }) => ({
    id,
    ...summary,
  }),
)

export const mockComplaintDetails: MockComplaintDetail[] = mockComplaintRecords
  .filter((_, index) => index % 18 === 0)
  .map((detail) => detail)

export const complaintsByRoadId: Record<string, ComplaintListItem[]> = mockRoads.reduce(
  (accumulator, road) => {
    accumulator[road.id] = mockComplaintSummaries.filter((complaint) =>
      complaint.title.includes(road.roadName) || complaint.roadName === road.roadName,
    )
    return accumulator
  },
  {} as Record<string, ComplaintListItem[]>,
)

export const complaintIssueTypeOptions = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'flooding', label: 'Flooding' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'lighting', label: 'Street lighting' },
  { value: 'congestion', label: 'Congestion' },
  { value: 'lane blockage', label: 'Lane blockage' },
  { value: 'construction delays', label: 'Construction delay' },
  { value: 'accident-prone zone', label: 'Accident-prone zone' },
  { value: 'pavement damage', label: 'Pavement damage' },
  { value: 'drainage blockage', label: 'Drainage blockage' },
  { value: 'median damage', label: 'Median damage' },
  { value: 'signage failure', label: 'Signage failure' },
  { value: 'encroachment', label: 'Encroachment' },
  { value: 'manhole cover', label: 'Manhole cover' },
] as const

export const complaintSeverityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const
