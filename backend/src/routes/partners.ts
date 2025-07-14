import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Get all partners for the agency
router.get('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const partners = await prisma.insurancePartner.findMany({
      where: { agencyId },
      orderBy: { name: 'asc' }
    });
    return res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Get a specific partner
router.get('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    
    const partner = await prisma.insurancePartner.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    return res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

// Create a new partner
router.post('/', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const {
      name,
      code,
      email,
      phone,
      website,
      address,
      isActive
    } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, code' 
      });
    }

    // Check if code already exists
    const existingPartner = await prisma.insurancePartner.findFirst({
      where: { 
        code,
        agencyId 
      }
    });

    if (existingPartner) {
      return res.status(400).json({ 
        error: 'Partner code already exists' 
      });
    }

    const partner = await prisma.insurancePartner.create({
      data: {
        name,
        code,
        email: email || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        isActive: isActive !== undefined ? isActive : true,
        agencyId
      }
    });

    return res.status(201).json(partner);
  } catch (error) {
    console.error('Error creating partner:', error);
    return res.status(500).json({ error: 'Failed to create partner' });
  }
});

// Update a partner
router.put('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;
    const {
      name,
      code,
      email,
      phone,
      website,
      address,
      isActive
    } = req.body;

    // Check if partner exists and belongs to agency
    const existingPartner = await prisma.insurancePartner.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingPartner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Validation
    if (!name || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, code' 
      });
    }

    // Check if code already exists (excluding current partner)
    const codeExists = await prisma.insurancePartner.findFirst({
      where: { 
        code,
        agencyId,
        NOT: { id }
      }
    });

    if (codeExists) {
      return res.status(400).json({ 
        error: 'Partner code already exists' 
      });
    }

    const partner = await prisma.insurancePartner.update({
      where: { id },
      data: {
        name,
        code,
        email: email || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        isActive: isActive !== undefined ? isActive : existingPartner.isActive
      }
    });

    return res.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return res.status(500).json({ error: 'Failed to update partner' });
  }
});

// Delete a partner
router.delete('/:id', async (req, res) => {
  try {
    const { agencyId } = req.user as any;
    const { id } = req.params;

    // Check if partner exists and belongs to agency
    const existingPartner = await prisma.insurancePartner.findFirst({
      where: { 
        id,
        agencyId 
      }
    });

    if (!existingPartner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Check if partner has associated policies
    const policiesCount = await prisma.policy.count({
      where: { 
        partnerId: id,
        agencyId 
      }
    });

    if (policiesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete partner with associated policies. Please deactivate instead.' 
      });
    }

    await prisma.insurancePartner.delete({
      where: { id }
    });

    return res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return res.status(500).json({ error: 'Failed to delete partner' });
  }
});

export default router; 