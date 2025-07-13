import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../services/database';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       required:
 *         - policyNumber
 *         - customerId
 *         - productId
 *         - partnerId
 *         - salesAgentId
 *         - agencyId
 *         - startDate
 *         - endDate
 *         - premium
 *         - commission
 *       properties:
 *         id:
 *           type: string
 *         policyNumber:
 *           type: string
 *         customerId:
 *           type: string
 *         productId:
 *           type: string
 *         partnerId:
 *           type: string
 *         salesAgentId:
 *           type: string
 *         agencyId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, EXPIRED, CANCELLED, PENDING]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         premium:
 *           type: number
 *         commission:
 *           type: number
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: Get all policies for the current agency
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, EXPIRED, CANCELLED, PENDING]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: salesAgentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of policies
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('status').optional().isIn(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']),
  query('customerId').optional().isString(),
  query('productId').optional().isString(),
  query('partnerId').optional().isString(),
  query('salesAgentId').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agencyId } = req.user as any;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const productId = req.query.productId as string;
    const partnerId = req.query.partnerId as string;
    const salesAgentId = req.query.salesAgentId as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { agencyId };

    if (search) {
      where.OR = [
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (salesAgentId) {
      where.salesAgentId = salesAgentId;
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          partner: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          salesAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.policy.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    return res.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

/**
 * @swagger
 * /api/policies/{id}:
 *   get:
 *     summary: Get policy by ID
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { 
        id,
        agencyId 
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            isCorporate: true,
            companyName: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            premium: true,
            commission: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            email: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    return res.json(policy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

/**
 * @swagger
 * /api/policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - productId
 *               - partnerId
 *               - startDate
 *               - endDate
 *               - premium
 *             properties:
 *               customerId:
 *                 type: string
 *               productId:
 *                 type: string
 *               partnerId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               commission:
 *                 type: number
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Policy created successfully
 */
router.post('/', [
  body('customerId').notEmpty().isString(),
  body('productId').notEmpty().isString(),
  body('partnerId').notEmpty().isString(),
  body('startDate').notEmpty().isISO8601(),
  body('endDate').notEmpty().isISO8601(),
  body('premium').notEmpty().isFloat({ min: 0 }),
  body('notes').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agencyId } = req.user as any;
    const policyData = {
      ...req.body,
      agencyId,
      salesAgentId: (req.user as any).id,
      status: 'DRAFT'
    };

    // Get product to calculate commission
    const product = await prisma.insuranceProduct.findUnique({
      where: { id: policyData.productId }
    });

    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Calculate commission
    if (product.commission) {
      policyData.commission = (policyData.premium * Number(product.commission)) / 100;
    }

    const policy = await prisma.policy.create({
      data: policyData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json(policy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create policy' });
  }
});

/**
 * @swagger
 * /api/policies/{id}:
 *   put:
 *     summary: Update policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, EXPIRED, CANCELLED, PENDING]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               commission:
 *                 type: number
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Policy updated successfully
 */
router.put('/:id', [
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('premium').optional().isFloat({ min: 0 }),
  body('notes').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const updatedPolicy = await prisma.policy.update({
      where: { id },
      data: req.body,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json(updatedPolicy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update policy' });
  }
});

/**
 * @swagger
 * /api/policies/{id}/activate:
 *   put:
 *     summary: Activate policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy activated successfully
 */
router.put('/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft policies can be activated' });
    }

    const updatedPolicy = await prisma.policy.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json(updatedPolicy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to activate policy' });
  }
});

/**
 * @swagger
 * /api/policies/{id}/cancel:
 *   put:
 *     summary: Cancel policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy cancelled successfully
 */
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Policy is already cancelled' });
    }

    const updatedPolicy = await prisma.policy.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json(updatedPolicy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel policy' });
  }
});

export default router; 