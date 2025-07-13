import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const partners = await prisma.insurancePartner.findMany({
      where: { agencyId, isActive: true }
    });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

export default router; 