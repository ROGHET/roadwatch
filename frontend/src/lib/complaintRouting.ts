export const ROAD_TYPE_OPTIONS = [
  { value: 'NH', label: 'NH' },
  { value: 'SH', label: 'SH' },
  { value: 'MDR', label: 'MDR' },
  { value: 'Urban Road', label: 'Urban Road' },
  { value: 'Village Road', label: 'Village Road' },
] as const

export const COMPLAINT_ISSUE_TYPE_OPTIONS = [
  { value: 'Pothole', label: 'Pothole' },
  { value: 'Road Crack', label: 'Road Crack' },
  { value: 'Waterlogging', label: 'Waterlogging' },
  { value: 'Missing Signage', label: 'Missing Signage' },
  { value: 'Streetlight Failure', label: 'Streetlight Failure' },
  { value: 'Accident Hazard', label: 'Accident Hazard' },
  { value: 'Other', label: 'Other' },
] as const

export type RoadType = (typeof ROAD_TYPE_OPTIONS)[number]['value']

export type AuthorityRouting = {
  assignedAuthority: string
  assignedDepartment: string
}

const ROUTING_BY_ROAD_TYPE: Record<RoadType, AuthorityRouting> = {
  NH: {
    assignedAuthority: 'NHAI',
    assignedDepartment: 'National Highways Division',
  },
  SH: {
    assignedAuthority: 'State PWD',
    assignedDepartment: 'State Public Works Department',
  },
  MDR: {
    assignedAuthority: 'District Engineer',
    assignedDepartment: 'District Roads & Bridges Division',
  },
  'Urban Road': {
    assignedAuthority: 'Municipal Corporation',
    assignedDepartment: 'Urban Roads & Infrastructure Wing',
  },
  'Village Road': {
    assignedAuthority: 'Rural Development Department',
    assignedDepartment: 'Rural Roads & Connectivity Cell',
  },
}

export function resolveAuthorityRouting(roadType: RoadType): AuthorityRouting {
  return ROUTING_BY_ROAD_TYPE[roadType]
}

export function buildMockComplaintId(sequence: number): string {
  const year = new Date().getFullYear()
  return `RW-${year}-${String(sequence).padStart(4, '0')}`
}
