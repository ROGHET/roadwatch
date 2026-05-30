import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidRoadType, resolveAuthorityRouting } from '../services/authorityMapping';
import { generateComplaintId } from '../services/complaintReference';
import { autoRouteComplaint } from '../services/routing';

const router = Router();
const prisma = new PrismaClient();

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const ISSUE_TYPES = [
  'Pothole',
  'Road Crack',
  'Waterlogging',
  'Missing Signage',
  'Streetlight Failure',
  'Accident Hazard',
  'Other',
] as const;

function validatePhotoUrl(photoUrl: unknown): { ok: true } | { ok: false; status: number; error: string } {
  if (photoUrl == null || photoUrl === '') {
    return { ok: true };
  }

  if (typeof photoUrl !== 'string') {
    return { ok: false, status: 400, error: 'photoUrl must be a data URL string.' };
  }

  const match = photoUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return { ok: false, status: 400, error: 'Photo must be uploaded as a base64 image data URL.' };
  }

  const [, mimeType, base64] = match;
  if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    return { ok: false, status: 400, error: 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.' };
  }

  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const byteLength = Math.floor((base64.length * 3) / 4) - padding;
  if (byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, status: 413, error: 'Uploaded image is too large. Please attach an image up to 10 MB.' };
  }

  return { ok: true };
}

router.post('/', async (req, res) => {
  try {
    const {
      roadType,
      issueType,
      severity,
      description,
      lat,
      lng,
      locationLabel,
      city,
      state,
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

    const photoValidation = validatePhotoUrl(photoUrl);
    if (photoValidation.ok === false) {
      return res.status(photoValidation.status).json({ error: photoValidation.error });
    }

    const routing = resolveAuthorityRouting(roadType);
    if (!routing) {
      return res.status(400).json({ error: 'Unable to route complaint for road type' });
    }

    const complaintId = await generateComplaintId(prisma);

    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        userId: null,
        roadType,
        issueType,
        assignedAuthority: routing.assignedAuthority,
        assignedDepartment: routing.assignedDepartment,
        severity,
        description,
        latitude: lat,
        longitude: lng,
        locationLabel,
        city,
        state,
        photoUrl,
        status: 'ROUTED',
      },
    });

    await autoRouteComplaint(complaint.id, lat, lng);

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaint.id },
    });

    res.status(201).json(updatedComplaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

router.get('/', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
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
