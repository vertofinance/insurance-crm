import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Get all products for the agency
router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const products = await prisma.insuranceProduct.findMany({
      where: { agencyId },
      include: {
        partner: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    
    const product = await prisma.insuranceProduct.findFirst({
      where: { 
        id,
        agencyId 
      },
      include: {
        partner: {
          select: {
            name: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const {
      name,
      description,
      category,
      premium,
      commission,
      partnerId,
      isActive
    } = req.body;

    // Validation
    if (!name || !category || !partnerId) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, partnerId' 
      });
    }

    if (premium <= 0) {
      return res.status(400).json({ 
        error: 'Premium must be greater than 0' 
      });
    }

    if (commission < 0 || commission > 100) {
      return res.status(400).json({ 
        error: 'Commission must be between 0 and 100' 
      });
    }

    // Check if partner exists and belongs to agency
    const partner = await prisma.insurancePartner.findFirst({
      where: { 
        id: partnerId,
        agencyId 
      }
    });

    if (!partner) {
      return res.status(400).json({ 
        error: 'Invalid insurance partner' 
      });
    }

    const product = await prisma.insuranceProduct.create({
      data: {
        name,
        description: description || null,
        category,
        premium: parseFloat(premium),
        commission: parseFloat(commission),
        isActive: isActive !== undefined ? isActive : true,
        partnerId,
        agencyId
      },
      include: {
        partner: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    const {
      name,
      description,
      category,
      premium,
      commission,
      partnerId,
      isActive
    } = req.body;

    // Check if product exists and belongs to agency
    const existingProduct = await prisma.insuranceProduct.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validation
    if (!name || !category || !partnerId) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, partnerId' 
      });
    }

    if (premium <= 0) {
      return res.status(400).json({ 
        error: 'Premium must be greater than 0' 
      });
    }

    if (commission < 0 || commission > 100) {
      return res.status(400).json({ 
        error: 'Commission must be between 0 and 100' 
      });
    }

    // Check if partner exists and belongs to agency
    const partner = await prisma.insurancePartner.findFirst({
      where: { 
        id: partnerId,
        agencyId 
      }
    });

    if (!partner) {
      return res.status(400).json({ 
        error: 'Invalid insurance partner' 
      });
    }

    const product = await prisma.insuranceProduct.update({
      where: { id },
      data: {
        name,
        description: description || null,
        category,
        premium: parseFloat(premium),
        commission: parseFloat(commission),
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
        partnerId
      },
      include: {
        partner: {
          select: {
            name: true
          }
        }
      }
    });

    return res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;

    // Check if product exists and belongs to agency
    const existingProduct = await prisma.insuranceProduct.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has associated policies
    const policiesCount = await prisma.policy.count({
      where: { 
        productId: id,
        agencyId 
      }
    });

    if (policiesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with associated policies. Please deactivate instead.' 
      });
    }

    await prisma.insuranceProduct.delete({
      where: { id }
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 