// Centralized Road Type enum — covers all India road categories
export const ROAD_TYPE_OPTIONS = [
  { value: 'NH', label: 'NH – National Highway' },
  { value: 'SH', label: 'SH – State Highway' },
  { value: 'MDR', label: 'MDR – Major District Road' },
  { value: 'ODR', label: 'ODR – Other District Road' },
  { value: 'VR', label: 'VR – Village Road' },
  { value: 'NH(O)', label: 'NH(O) – National Highway (Original)' },
  { value: 'LWE', label: 'LWE – Left Wing Extremism Road' },
  { value: 'ESIC', label: 'ESIC – Employee State Insurance Road' },
  { value: 'Expressway', label: 'Expressway' },
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
  { value: 'Road Blockage', label: 'Road Blockage' },
  { value: 'Under Construction', label: 'Under Construction (No Sign)' },
  { value: 'Bridge Damage', label: 'Bridge / Culvert Damage' },
  { value: 'Encroachment', label: 'Encroachment' },
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
  ODR: {
    assignedAuthority: 'District Engineer',
    assignedDepartment: 'Other District Roads Cell',
  },
  VR: {
    assignedAuthority: 'Rural Development Department',
    assignedDepartment: 'PMGSY – Village Connectivity Cell',
  },
  'NH(O)': {
    assignedAuthority: 'NHAI / State PWD',
    assignedDepartment: 'Original National Highways Division',
  },
  LWE: {
    assignedAuthority: 'Ministry of Home Affairs',
    assignedDepartment: 'LWE Road Connectivity Program',
  },
  ESIC: {
    assignedAuthority: 'ESIC Authority',
    assignedDepartment: 'Employee State Insurance Corporation Roads',
  },
  Expressway: {
    assignedAuthority: 'NHAI / State Expressway Authority',
    assignedDepartment: 'Expressway Operations Division',
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
