import type { ComplaintCardProps } from '../components/complaints/ComplaintCard'
import type { ComplaintListItem } from '../components/complaints/ComplaintListSection'
import type { RoadType } from '../lib/complaintRouting'

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

import { infrastructureReports } from './infrastructureReports'

export const mockComplaintRecords: MockComplaintRecord[] = infrastructureReports

export const mockComplaintSummaries: ComplaintListItem[] = infrastructureReports.map((record) => ({
  id: record.id,
  referenceId: record.referenceId,
  title: record.title,
  roadName: record.roadName,
  issueType: record.issueType,
  severity: record.severity,
  status: record.status,
  reportedAt: record.reportedAt,
}))

export const mockComplaintDetails: MockComplaintDetail[] = infrastructureReports

export const complaintsByRoadId: Record<string, ComplaintListItem[]> = infrastructureReports.reduce(
  (acc, record) => {
    const list = acc[record.roadId] ?? []
    list.push({
      id: record.id,
      referenceId: record.referenceId,
      title: record.title,
      roadName: record.roadName,
      issueType: record.issueType,
      severity: record.severity,
      status: record.status,
      reportedAt: record.reportedAt,
    })
    acc[record.roadId] = list
    return acc
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
