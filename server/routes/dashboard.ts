import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/metrics', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const metrics = db.getMetrics(req.user);
  return res.json({ metrics });
});
