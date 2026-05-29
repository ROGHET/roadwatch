import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { autoRouteComplaint } from '../services/routing';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { userId, issueType, severity, description, lat, lng, photoUrl } = req.body;

    // Create the complaint
    const complaint = await prisma.complaint.create({
      data: {
        userId,
        issueType,
        severity,
        description,
        latitude: lat,
        longitude: lng,
        photoUrl,
        status: 'PENDING'
      }
    });

    const complaintId = complaint.id;

    // Trigger async routing
    await autoRouteComplaint(complaintId, lat, lng);

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { authority: true, road: true }
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
      include: {
        authority: true,
        road: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { authority: true, road: true }
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
