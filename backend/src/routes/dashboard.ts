import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 */
router.get('/overview', async (req, res) => {
  try {
    const { agencyId } = req.user as any;

    // Get counts
    const [
      totalCustomers,
      totalPolicies,
      activePolicies,
      totalSales,
      totalRevenue,
      totalCommission
    ] = await Promise.all([
      prisma.customer.count({ where: { agencyId, isActive: true } }),
      prisma.policy.count({ where: { agencyId } }),
      prisma.policy.count({ where: { agencyId, status: 'ACTIVE' } }),
      prisma.sale.count({ where: { agencyId } }),
      prisma.sale.aggregate({
        where: { agencyId },
        _sum: { amount: true }
      }),
      prisma.sale.aggregate({
        where: { agencyId },
        _sum: { commission: true }
      })
    ]);

    // Get recent policies
    const recentPolicies = await prisma.policy.findMany({
      where: { agencyId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true,
            isCorporate: true
          }
        },
        product: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    // Get policy status distribution
    const policyStatuses = await prisma.policy.groupBy({
      by: ['status'],
      where: { agencyId },
      _count: { status: true }
    });

    // Get monthly sales for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: {
        agencyId,
        saleDate: { gte: sixMonthsAgo }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    res.json({
      overview: {
        totalCustomers,
        totalPolicies,
        activePolicies,
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalCommission: totalCommission._sum.commission || 0
      },
      recentPolicies,
      policyStatuses,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * @swagger
 * /api/dashboard/sales-performance:
 *   get:
 *     summary: Get sales performance data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales performance data
 */
router.get('/sales-performance', async (req, res) => {
  try {
    const { agencyId } = req.user as any;

    // Get top performing agents
    const topAgents = await prisma.sale.groupBy({
      by: ['salesAgentId'],
      where: { agencyId },
      _sum: { amount: true, commission: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    // Get agent details
    const agentIds = topAgents.map(agent => agent.salesAgentId);
    const agents = await prisma.user.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    const topAgentsWithDetails = topAgents.map(agent => {
      const agentDetails = agents.find(a => a.id === agent.salesAgentId);
      return {
        ...agent,
        agent: agentDetails
      };
    });

    // Get product performance
    const productPerformance = await prisma.policy.groupBy({
      by: ['productId'],
      where: { agencyId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // Get product details
    const productIds = productPerformance.map(p => p.productId);
    const products = await prisma.insuranceProduct.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true }
    });

    const productPerformanceWithDetails = productPerformance.map(product => {
      const productDetails = products.find(p => p.id === product.productId);
      return {
        ...product,
        product: productDetails
      };
    });

    res.json({
      topAgents: topAgentsWithDetails,
      productPerformance: productPerformanceWithDetails
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales performance data' });
  }
});

/**
 * @swagger
 * /api/dashboard/expiring-policies:
 *   get:
 *     summary: Get policies expiring soon
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expiring policies data
 */
router.get('/expiring-policies', async (req, res) => {
  try {
    const { agencyId } = req.user as any;

    // Get policies expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringPolicies = await prisma.policy.findMany({
      where: {
        agencyId,
        status: 'ACTIVE',
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
            isCorporate: true
          }
        },
        product: {
          select: {
            name: true,
            category: true
          }
        },
        salesAgent: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });

    res.json(expiringPolicies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expiring policies' });
  }
});

export default router; 