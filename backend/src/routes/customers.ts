import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../services/database';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - phone
 *         - agencyId
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         tinNumber:
 *           type: string
 *         companyName:
 *           type: string
 *         companyReg:
 *           type: string
 *         isCorporate:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         agencyId:
 *           type: string
 *         assignedTo:
 *           type: string
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers for the current agency
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isCorporate
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('isCorporate').optional().isBoolean(),
  query('assignedTo').optional().isString()
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
    const isCorporate = req.query.isCorporate === 'true';
    const assignedTo = req.query.assignedTo as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { agencyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isCorporate !== undefined) {
      where.isCorporate = isCorporate;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
      prisma.customer.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    return res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        agencyId 
      },
      include: {
        salesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        policies: {
          select: {
            id: true,
            policyNumber: true,
            status: true,
            startDate: true,
            endDate: true,
            premium: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               tinNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               companyReg:
 *                 type: string
 *               isCorporate:
 *                 type: boolean
 *               assignedTo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post('/', [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phone').notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('address').optional().isString(),
  body('dateOfBirth').optional().isISO8601(),
  body('tinNumber').optional().isString(),
  body('companyName').optional().isString(),
  body('companyReg').optional().isString(),
  body('isCorporate').optional().isBoolean(),
  body('assignedTo').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agencyId } = req.user as any;
    const customerData = {
      ...req.body,
      agencyId,
      isCorporate: req.body.isCorporate || false
    };

    const customer = await prisma.customer.create({
      data: customerData,
      include: {
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

    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               tinNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               companyReg:
 *                 type: string
 *               isCorporate:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.put('/:id', [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('address').optional().isString(),
  body('dateOfBirth').optional().isISO8601(),
  body('tinNumber').optional().isString(),
  body('companyName').optional().isString(),
  body('companyReg').optional().isString(),
  body('isCorporate').optional().isBoolean(),
  body('assignedTo').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { agencyId } = req.user as any;

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: req.body,
      include: {
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

    return res.json(updatedCustomer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Deactivate customer
 *     tags: [Customers]
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
 *         description: Customer deactivated successfully
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Soft delete by setting isActive to false
    await prisma.customer.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({ message: 'Customer deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to deactivate customer' });
  }
});

/**
 * @swagger
 * /api/customers/{id}/policies:
 *   get:
 *     summary: Get customer policies
 *     tags: [Customers]
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
 *         description: Customer policies
 */
router.get('/:id/policies', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agencyId } = req.user as any;

    const policies = await prisma.policy.findMany({
      where: { 
        customerId: id,
        agencyId 
      },
      include: {
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer policies' });
  }
});

export default router; 