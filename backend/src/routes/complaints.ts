import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidRoadType, resolveAuthorityRouting } from '../services/authorityMapping';
import { generateComplaintId } from '../services/complaintReference';
import { autoRouteComplaint } from '../services/routing';

const router = Router();
const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'citizen@example.com';

const ISSUE_TYPES = [
  'Pothole',
  'Road Crack',
  'Waterlogging',
  'Missing Signage',
  'Streetlight Failure',
  'Accident Hazard',
  'Other',
] as const;

async function resolveUserId(userId: string | undefined): Promise<string> {
  if (userId) {
    return userId;
  }

  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  if (!demoUser) {
    throw new Error('DEMO_USER_NOT_FOUND');
  }

  return demoUser.id;
}

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      roadType,
      issueType,
      severity,
      description,
      lat,
      lng,
      photoUrl,
    } = req.body;

    if (!roadType || !isValidRoadType(roadType)) {
      return res.status(400).json({ error: 'Valid roadType is required' });
    }

    if (!issueType || !ISSUE_TYPES.includes(issueType)) {
      return res.status(400).json({ error: 'Valid issueType is required' });
    }

    if (!severity || !description || lat == null || lng == null) {
      return res.status(400).json({ error: 'severity, description, lat, and lng are required' });
    }

    const routing = resolveAuthorityRouting(roadType);
    if (!routing) {
      return res.status(400).json({ error: 'Unable to route complaint for road type' });
    }

    const resolvedUserId = await resolveUserId(userId);
    const complaintId = await generateComplaintId(prisma);

    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        userId: resolvedUserId,
        roadType,
        issueType,
        assignedAuthority: routing.assignedAuthority,
        assignedDepartment: routing.assignedDepartment,
        severity,
        description,
        latitude: lat,
        longitude: lng,
        photoUrl,
        status: 'ROUTED',
      },
    });

    await autoRouteComplaint(complaint.id, lat, lng);

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaint.id },
      include: { authority: true, road: true },
    });

    res.status(201).json(updatedComplaint);
  } catch (error) {
    if (error instanceof Error && error.message === 'DEMO_USER_NOT_FOUND') {
      return res.status(500).json({ error: 'Demo user not found. Run database seed.' });
    }
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

router.get('/', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        authority: true,
        road: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id: req.params.id }, { complaintId: req.params.id }],
      },
      include: { authority: true, road: true },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

export default router;
