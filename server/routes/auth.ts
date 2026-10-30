import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import {
  registerSchema,
  loginSchema,
  generateToken,
  authenticateJWT,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, department, role } = parseResult.data;

    const existingUser = await db.findUserByEmailAsync(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this enterprise email already exists' });
    }

    const salt = bcrypt.genSaltSync(12);
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await db.createUserAsync({
      name,
      email,
      password_hash,
      role: role as 'admin' | 'manager' | 'employee',
      department,
    });

    db.recordAuditLog({
      user_id: newUser.id,
      user_name: newUser.name,
      department: newUser.department,
      action: 'USER_REGISTER',
      module: 'Identity & Access',
      details: { role: newUser.role, department: newUser.department },
      ip_address: req.ip || '127.0.0.1',
    });

    const token = generateToken(newUser);

    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account provisioned successfully',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

authRouter.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parseResult.data;
    const user = await db.findUserByEmailAsync(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid enterprise credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid enterprise credentials' });
    }

    const token = generateToken(user);

    db.recordAuditLog({
      user_id: user.id,
      user_name: user.name,
      department: user.department,
      action: 'USER_LOGIN',
      module: 'Identity & Access',
      details: { role: user.role },
      ip_address: req.ip || '127.0.0.1',
    });

    const { password_hash: _, ...safeUser } = user;
    return res.json({
      message: 'Authentication successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

authRouter.get('/profile', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { password_hash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

authRouter.get('/all', authenticateJWT, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  return res.json({ users });
});
