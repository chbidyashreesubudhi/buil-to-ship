import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db, User } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'nexus_enterprise_jwt_super_secure_vault_2026';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().min(2, 'Department is required'),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const workflowSchema = z.object({
  name: z.string().min(3, 'Workflow name must be at least 3 characters'),
  description: z.string().optional(),
  triggerEvent: z.string().min(2, 'Trigger event is required'),
  actionType: z.string().min(2, 'Action type is required'),
  isActive: z.boolean().default(true),
  department: z.string().optional(),
});

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await db.findUserByIdAsync(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(...allowedRoles: Array<'admin' | 'manager' | 'employee'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Insufficient enterprise clearance for role "${req.user.role}".`,
      });
    }
    next();
  };
}
