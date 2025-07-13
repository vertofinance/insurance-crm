import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        agencyId: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        agencyId: true,
        isActive: true,
        agency: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });

    if (!user || !user.isActive || !user.agency.isActive) {
      res.status(401).json({ error: 'Invalid or inactive user' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: 'Insufficient permissions for this action' 
      });
      return;
    }

    next();
  };
};

// Agency-specific authorization (ensures users can only access their agency's data)
export const authorizeAgency = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // For agency managers, they can access all data within their agency
  if (req.user.role === UserRole.AGENCY_MANAGER) {
    next();
    return;
  }

  // For other roles, check if they're accessing their own agency's data
  const requestedAgencyId = req.params.agencyId || req.body.agencyId;
  
  if (requestedAgencyId && requestedAgencyId !== req.user.agencyId) {
    res.status(403).json({ 
      message: 'Access denied to other agency data' 
    });
    return;
  }

  next();
};

// Sales agent authorization (can only access their assigned customers)
export const authorizeSalesAgent = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role === UserRole.SALES_AGENT) {
    const customerId = req.params.customerId || req.body.customerId;
    
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          agencyId: req.user.agencyId,
          assignedTo: req.user.id
        }
      });

      if (!customer) {
        res.status(403).json({ 
          message: 'Access denied to customer data' 
        });
        return;
      }
    }
  }

  next();
};

// HR Manager authorization (can only manage users)
export const authorizeHRManager = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role === UserRole.HR_MANAGER) {
    // HR managers can only access user management endpoints
    const allowedPaths = ['/api/users'];
    const currentPath = req.path;
    
    if (!allowedPaths.some(path => currentPath.startsWith(path))) {
      res.status(403).json({ 
        message: 'HR Manager can only access user management features' 
      });
      return;
    }
  }

  next();
}; 