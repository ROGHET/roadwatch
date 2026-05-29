import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const roads = await prisma.road.findMany({
      include: {
        authority: true
      }
    });
    res.json(roads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roads' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const road = await prisma.road.findUnique({
      where: { id: req.params.id },
      include: { 
        authority: true,
        complaints: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }
    
    res.json(road);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch road' });
  }
});

export default router;
