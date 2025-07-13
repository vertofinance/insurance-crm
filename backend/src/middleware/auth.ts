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
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
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
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions for this action' 
      });
    }

    next();
  };
};

// Agency-specific authorization (ensures users can only access their agency's data)
export const authorizeAgency = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // For agency managers, they can access all data within their agency
  if (req.user.role === UserRole.AGENCY_MANAGER) {
    return next();
  }

  // For other roles, check if they're accessing their own agency's data
  const requestedAgencyId = req.params.agencyId || req.body.agencyId;
  
  if (requestedAgencyId && requestedAgencyId !== req.user.agencyId) {
    return res.status(403).json({ 
      message: 'Access denied to other agency data' 
    });
  }

  next();
};

// Sales agent authorization (can only access their assigned customers)
export const authorizeSalesAgent = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
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
        return res.status(403).json({ 
          message: 'Access denied to customer data' 
        });
      }
    }
  }

  next();
};

// HR Manager authorization (can only manage users)
export const authorizeHRManager = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === UserRole.HR_MANAGER) {
    // HR managers can only access user management endpoints
    const allowedPaths = ['/api/users'];
    const currentPath = req.path;
    
    if (!allowedPaths.some(path => currentPath.startsWith(path))) {
      return res.status(403).json({ 
        message: 'HR Manager can only access user management features' 
      });
    }
  }

  next();
}; 