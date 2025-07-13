import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const products = await prisma.insuranceProduct.findMany({
      where: { agencyId, isActive: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router; 