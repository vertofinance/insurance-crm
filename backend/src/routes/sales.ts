import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const sales = await prisma.sale.findMany({
      where: { agencyId },
      include: {
        policy: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true
              }
            }
          }
        },
        salesAgent: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { saleDate: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

export default router; 