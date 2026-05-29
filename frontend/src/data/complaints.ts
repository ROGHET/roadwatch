import type { ComplaintCardProps } from '../components/complaints/ComplaintCard'
import type { ComplaintListItem } from '../components/complaints/ComplaintListSection'

export type MockComplaintDetail = {
  id: string
  roadId: string
} & Omit<ComplaintCardProps, 'footer' | 'className'>

export const mockComplaintSummaries: ComplaintListItem[] = [
  {
    id: 'cmp-001',
    referenceId: 'RW-2026-001',
    title: 'Deep potholes near Tidel Park junction',
    roadName: 'Rajiv Gandhi Salai (OMR)',
    status: 'pending',
    severity: 'high',
    reportedAt: '28 May 2026',
  },
  {
    id: 'cmp-002',
    referenceId: 'RW-2026-002',
    title: 'Waterlogging after monsoon showers',
    roadName: 'GST Road (NH-32)',
    status: 'routed',
    severity: 'medium',
    reportedAt: '27 May 2026',
  },
  {
    id: 'cmp-003',
    referenceId: 'RW-2026-003',
    title: 'Non-functional street lights for 400 metres',
    roadName: 'OMR Service Lane',
    status: 'in_review',
    severity: 'low',
    reportedAt: '26 May 2026',
  },
  {
    id: 'cmp-004',
    referenceId: 'RW-2026-004',
    title: 'Damaged median barrier near toll plaza',
    roadName: 'East Coast Road (ECR)',
    status: 'resolved',
    severity: 'critical',
    reportedAt: '24 May 2026',
  },
  {
    id: 'cmp-005',
    referenceId: 'RW-2026-005',
    title: 'Open manhole cover on service road',
    roadName: 'Anna Salai (Mount Road)',
    status: 'pending',
    severity: 'critical',
    reportedAt: '23 May 2026',
  },
  {
    id: 'cmp-006',
    referenceId: 'RW-2026-006',
    title: 'Faded zebra crossing near school zone',
    roadName: 'Sardar Patel Road',
    status: 'routed',
    severity: 'medium',
    reportedAt: '22 May 2026',
  },
  {
    id: 'cmp-007',
    referenceId: 'RW-2026-007',
    title: 'Illegal speed breaker causing vehicle damage',
    roadName: 'Hosur Road (NH-48)',
    status: 'rejected',
    severity: 'low',
    reportedAt: '20 May 2026',
  },
  {
    id: 'cmp-008',
    referenceId: 'RW-2026-008',
    title: 'Road shoulder erosion near flyover',
    roadName: 'Western Express Highway',
    status: 'in_review',
    severity: 'high',
    reportedAt: '19 May 2026',
  },
]

export const mockComplaintDetails: MockComplaintDetail[] = [
  {
    id: 'cmp-001',
    roadId: 'chennai-omr-service-lane',
    title: 'Deep potholes near Tidel Park junction',
    description:
      'Multiple potholes 15–20 cm deep on the southbound lane causing two-wheelers to swerve into adjacent traffic.',
    roadName: 'Rajiv Gandhi Salai (OMR)',
    issueType: 'pothole',
    severity: 'high',
    status: 'pending',
    reportedAt: '28 May 2026',
  },
  {
    id: 'cmp-002',
    roadId: 'chennai-gst-road',
    title: 'Waterlogging after monsoon showers',
    description:
      'Standing water for over 200 metres near Chromepet bus stop. Drain cover appears blocked.',
    roadName: 'GST Road (NH-32)',
    issueType: 'waterlogging',
    severity: 'medium',
    status: 'routed',
    reportedAt: '27 May 2026',
  },
  {
    id: 'cmp-004',
    roadId: 'chennai-ecr-highway',
    title: 'Damaged median barrier near toll plaza',
    description:
      'Concrete median blocks displaced after a collision. Exposed rebar visible on the fast lane side.',
    roadName: 'East Coast Road (ECR)',
    issueType: 'road damage',
    severity: 'critical',
    status: 'resolved',
    reportedAt: '24 May 2026',
  },
  {
    id: 'cmp-006',
    roadId: 'chennai-sardar-patel-road',
    title: 'Faded zebra crossing near school zone',
    description:
      'Pedestrian crossing markings barely visible at St. Thomas Mount Primary School gate.',
    roadName: 'Sardar Patel Road',
    issueType: 'markings',
    severity: 'medium',
    status: 'routed',
    reportedAt: '22 May 2026',
  },
]

export const complaintsByRoadId: Record<string, ComplaintListItem[]> = {
  'chennai-sardar-patel-road': mockComplaintSummaries.filter((complaint) =>
    ['cmp-006'].includes(complaint.id),
  ),
  'chennai-gst-road': mockComplaintSummaries.filter((complaint) =>
    ['cmp-002'].includes(complaint.id),
  ),
  'chennai-omr-service-lane': mockComplaintSummaries.filter((complaint) =>
    ['cmp-001', 'cmp-003'].includes(complaint.id),
  ),
  'chennai-ecr-highway': mockComplaintSummaries.filter((complaint) =>
    ['cmp-004'].includes(complaint.id),
  ),
  'chennai-anna-salai': mockComplaintSummaries.filter((complaint) =>
    ['cmp-005'].includes(complaint.id),
  ),
  'mumbai-western-express': mockComplaintSummaries.filter((complaint) =>
    ['cmp-008'].includes(complaint.id),
  ),
  'bengaluru-hosur-road': mockComplaintSummaries.filter((complaint) =>
    ['cmp-007'].includes(complaint.id),
  ),
  'delhi-ring-road': [],
}

export const complaintIssueTypeOptions = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'lighting', label: 'Street lighting' },
  { value: 'markings', label: 'Road markings' },
  { value: 'damage', label: 'Road damage' },
  { value: 'drainage', label: 'Drainage blockage' },
] as const

export const complaintSeverityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const
