import { Router } from 'express';
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
  query('status').optional().isIn(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']),
  query('customerId').optional().isString(),
  query('salesAgentId').optional().isString(),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agencyId } = req.user as any;
    const page = (req.query.page as number) || 1;
    const limit = (req.query.limit as number) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const salesAgentId = req.query.salesAgentId as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { agencyId };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (salesAgentId) {
      where.salesAgentId = salesAgentId;
    }

    if (search) {
      where.OR = [
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
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
              companyName: true,
              isCorporate: true
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
              name: true
            }
          },
          salesAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.policy.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policies' });
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
router.get('/:id', async (req, res) => {
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
            companyName: true,
            isCorporate: true
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
            email: true,
            phone: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reminders: {
          orderBy: { reminderDate: 'asc' }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy' });
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
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  body('premium').isFloat({ min: 0 }),
  body('commission').optional().isFloat({ min: 0 }),
  body('documents').optional().isArray(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agencyId, id: salesAgentId } = req.user as any;
    const policyData = req.body;

    // Validate dates
    const startDate = new Date(policyData.startDate);
    const endDate = new Date(policyData.endDate);

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Generate policy number
    const policyNumber = `POL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Calculate commission if not provided
    if (!policyData.commission) {
      const product = await prisma.insuranceProduct.findUnique({
        where: { id: policyData.productId }
      });
      
      if (product) {
        policyData.commission = (policyData.premium * product.commission) / 100;
      }
    }

    const policy = await prisma.policy.create({
      data: {
        ...policyData,
        policyNumber,
        salesAgentId,
        agencyId,
        status: 'DRAFT'
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            isCorporate: true
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
            name: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create policy' });
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
  body('status').optional().isIn(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('premium').optional().isFloat({ min: 0 }),
  body('commission').optional().isFloat({ min: 0 }),
  body('documents').optional().isArray(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { agencyId } = req.user as any;
    const updateData = req.body;

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);

      if (startDate >= endDate) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    const policy = await prisma.policy.updateMany({
      where: { 
        id,
        agencyId 
      },
      data: updateData
    });

    if (policy.count === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const updatedPolicy = await prisma.policy.findFirst({
      where: { id, agencyId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            isCorporate: true
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
            name: true
          }
        },
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy' });
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
router.put('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { id, agencyId }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status !== 'DRAFT' && policy.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only draft or pending policies can be activated' });
    }

    await prisma.policy.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });

    res.json({ message: 'Policy activated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate policy' });
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
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policy = await prisma.policy.findFirst({
      where: { id, agencyId }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status === 'CANCELLED' || policy.status === 'EXPIRED') {
      return res.status(400).json({ error: 'Policy is already cancelled or expired' });
    }

    await prisma.policy.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel policy' });
  }
});

export default router; 