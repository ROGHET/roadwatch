import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function autoRouteComplaint(complaintId: string, lat: number, lng: number) {
  // PostGIS Nearest Neighbor approach (PostgreSQL raw query)
  // 1. Find the nearest road segment to the complaint location
  // 2. Assign the complaint to that road and its authority
  
  // Create a PostGIS point from the lat/lng
  const point = `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  try {
    const nearestRoads = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, "authorityId", ST_Distance(geometry, ${point}) as distance
      FROM "Road"
      ORDER BY geometry <-> ${point}
      LIMIT 1
    `);

    if (nearestRoads.length > 0) {
      const road = nearestRoads[0];
      
      // Update the complaint with the routed road and authority
      await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          roadId: road.id,
          authorityId: road.authorityId,
          status: 'ROUTED'
        }
      });
      
      return { success: true, roadId: road.id, authorityId: road.authorityId };
    }
    
    return { success: false, reason: 'No nearby roads found' };
  } catch (error) {
    console.error('Error auto-routing complaint:', error);
    return { success: false, reason: 'Database routing error' };
  }
}
