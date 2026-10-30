import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

export const auditLogsRouter = Router();

// GET /api/audit-logs - Retrieve immutable system logs (Admin full access, Manager/Employee department scoped)
auditLogsRouter.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const logs = await db.getAuditLogsAsync(req.user);
  return res.json({
    logs,
    totalCount: logs.length,
    retentionPolicy: '90_DAYS_IMMUTABLE',
  });
});
