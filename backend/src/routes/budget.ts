import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/budget/summary - Aggregate total budgets across all roads
router.get('/summary', async (req, res) => {
  try {
    const roads = await prisma.road.findMany({
      select: {
        budgetSanctioned: true,
        budgetSpent: true,
        authority: { select: { name: true } }
      }
    });

    let totalSanctioned = 0;
    let totalSpent = 0;
    const byAuthority: Record<string, { sanctioned: number, spent: number }> = {};

    for (const road of roads) {
      const sanctioned = road.budgetSanctioned || 0;
      const spent = road.budgetSpent || 0;
      
      totalSanctioned += sanctioned;
      totalSpent += spent;

      const authName = road.authority.name;
      if (!byAuthority[authName]) {
        byAuthority[authName] = { sanctioned: 0, spent: 0 };
      }
      byAuthority[authName].sanctioned += sanctioned;
      byAuthority[authName].spent += spent;
    }

    res.json({
      totalSanctioned,
      totalSpent,
      byAuthority
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
});

// GET /api/budget/road/:id - Get specific budget for a road
router.get('/road/:id', async (req, res) => {
  try {
    const road = await prisma.road.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        budgetSanctioned: true,
        budgetSpent: true,
        contractor: true
      }
    });

    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }

    res.json(road);
  } catch (error) {
    console.error('Road budget error:', error);
    res.status(500).json({ error: 'Failed to fetch road budget' });
  }
});

export default router;
