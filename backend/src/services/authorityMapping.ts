export const ROAD_TYPES = [
  'NH',
  'SH',
  'MDR',
  'Urban Road',
  'Village Road',
] as const

export type RoadType = (typeof ROAD_TYPES)[number]

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

export function resolveAuthorityRouting(roadType: string): AuthorityRouting | null {
  if (!(roadType in ROUTING_BY_ROAD_TYPE)) {
    return null
  }
  return ROUTING_BY_ROAD_TYPE[roadType as RoadType]
}

export function isValidRoadType(roadType: string): roadType is RoadType {
  return ROAD_TYPES.includes(roadType as RoadType)
}
