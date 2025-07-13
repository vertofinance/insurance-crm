import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId }
    });
    res.json(agency);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agency' });
  }
});

export default router; 