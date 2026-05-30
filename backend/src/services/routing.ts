import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function autoRouteComplaint(complaintId: string, lat: number, lng: number) {
  try {
    const roads = await prisma.road.findMany({
      select: { id: true, authorityId: true, startLat: true, startLng: true, endLat: true, endLng: true }
    });

    let nearestRoad = null;
    let minDistance = Infinity;

    for (const r of roads) {
      if (r.startLat != null && r.startLng != null && r.endLat != null && r.endLng != null) {
        const midLat = (r.startLat + r.endLat) / 2;
        const midLng = (r.startLng + r.endLng) / 2;
        
        const dist = haversineDistance(lat, lng, midLat, midLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestRoad = r;
        }
      }
    }

    if (nearestRoad) {
      // Update the complaint with the routed road and authority
      await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          roadId: nearestRoad.id,
          authorityId: nearestRoad.authorityId,
        },
      });
      
      return { success: true, roadId: nearestRoad.id, authorityId: nearestRoad.authorityId };
    }
    
    return { success: false, reason: 'No nearby roads found' };
  } catch (error) {
    console.error('Error auto-routing complaint:', error);
    return { success: false, reason: 'Database routing error' };
  }
}
