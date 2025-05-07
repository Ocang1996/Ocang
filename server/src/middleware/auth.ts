import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User.js';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret') as {
      user: {
        id: string;
        role: UserRole;
      };
    };

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is admin or superadmin
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to access this resource' });
    }
  });
};

// Middleware to check if user is superadmin
export const superAdminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (req.user?.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to access this resource' });
    }
  });
}; 