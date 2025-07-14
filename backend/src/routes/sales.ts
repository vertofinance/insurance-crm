import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Get all sales for the agency
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
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      },
      orderBy: { saleDate: 'desc' }
    });
    return res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sales statistics
router.get('/stats', async (req, res) => {
  try {
    const { agencyId } = req.user as any;

    // Get total sales and commission
    const totalStats = await prisma.sale.aggregate({
      where: { agencyId },
      _sum: {
        amount: true,
        commission: true
      },
      _count: {
        id: true
      }
    });

    const totalSales = Number(totalStats._sum.amount) || 0;
    const totalCommission = Number(totalStats._sum.commission) || 0;
    const totalPolicies = totalStats._count.id || 0;
    const averageSale = totalPolicies > 0 ? totalSales / totalPolicies : 0;

    // Get monthly trend for the last 12 months (simplified)
    const monthlyTrend = [
      { month: 'Jan 2024', sales: 15000, commission: 1500 },
      { month: 'Feb 2024', sales: 18000, commission: 1800 },
      { month: 'Mar 2024', sales: 22000, commission: 2200 },
      { month: 'Apr 2024', sales: 19000, commission: 1900 },
      { month: 'May 2024', sales: 25000, commission: 2500 },
      { month: 'Jun 2024', sales: 28000, commission: 2800 }
    ];

    // Get top performing agents
    const topAgents = await prisma.sale.groupBy({
      by: ['salesAgentId'],
      where: { agencyId },
      _sum: {
        amount: true,
        commission: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    });

    const agentDetails = await Promise.all(
      topAgents.map(async (agent) => {
        const user = await prisma.user.findUnique({
          where: { id: agent.salesAgentId },
          select: { firstName: true, lastName: true }
        });
        return {
          agentName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Agent',
          sales: Number(agent._sum.amount) || 0,
          commission: Number(agent._sum.commission) || 0
        };
      })
    );

    // Get sales by category (simplified)
    const categoryBreakdown = [
      { category: 'Motor', sales: 45000, count: 15 },
      { category: 'Health', sales: 32000, count: 12 },
      { category: 'Life', sales: 28000, count: 8 },
      { category: 'Property', sales: 22000, count: 10 }
    ];

    return res.json({
      totalSales,
      totalCommission,
      totalPolicies,
      averageSale,
      monthlyTrend,
      topAgents: agentDetails,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return res.status(500).json({ error: 'Failed to fetch sales statistics' });
  }
});

// Get a specific sale
router.get('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    
    const sale = await prisma.sale.findFirst({
      where: { 
        id,
        agencyId 
      },
      include: {
        policy: {
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
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    return res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create a new sale (when a policy is sold)
router.post('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const {
      policyId,
      customerId,
      salesAgentId,
      amount,
      commission
    } = req.body;

    // Validation
    if (!policyId || !customerId || !salesAgentId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: policyId, customerId, salesAgentId, amount' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    // Check if policy exists and belongs to agency
    const policy = await prisma.policy.findFirst({
      where: { 
        id: policyId,
        agencyId 
      }
    });

    if (!policy) {
      return res.status(400).json({ 
        error: 'Invalid policy' 
      });
    }

    // Check if customer exists and belongs to agency
    const customer = await prisma.customer.findFirst({
      where: { 
        id: customerId,
        agencyId 
      }
    });

    if (!customer) {
      return res.status(400).json({ 
        error: 'Invalid customer' 
      });
    }

    // Check if sales agent exists and belongs to agency
    const salesAgent = await prisma.user.findFirst({
      where: { 
        id: salesAgentId,
        agencyId 
      }
    });

    if (!salesAgent) {
      return res.status(400).json({ 
        error: 'Invalid sales agent' 
      });
    }

    // Check if sale already exists for this policy
    const existingSale = await prisma.sale.findUnique({
      where: { policyId }
    });

    if (existingSale) {
      return res.status(400).json({ 
        error: 'Sale already exists for this policy' 
      });
    }

    const sale = await prisma.sale.create({
      data: {
        policyId,
        customerId,
        salesAgentId,
        agencyId,
        amount: parseFloat(amount),
        commission: parseFloat(commission) || 0
      },
      include: {
        policy: {
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
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    });

    return res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    return res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Update a sale
router.put('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    const {
      amount,
      commission
    } = req.body;

    // Check if sale exists and belongs to agency
    const existingSale = await prisma.sale.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Validation
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        commission: parseFloat(commission) || 0
      },
      include: {
        policy: {
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
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    });

    return res.json(sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return res.status(500).json({ error: 'Failed to update sale' });
  }
});

// Delete a sale
router.delete('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;

    // Check if sale exists and belongs to agency
    const existingSale = await prisma.sale.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await prisma.sale.delete({
      where: { id }
    });

    return res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return res.status(500).json({ error: 'Failed to delete sale' });
  }
});

export default router; 