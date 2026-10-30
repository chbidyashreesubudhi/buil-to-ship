import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // Time-series data for operational velocity and cost savings
  const monthlyTrends = [
    { month: 'May', manualHours: 420, automatedHours: 110, costSavingsUSD: 8580, tokenCount: 450000 },
    { month: 'Jun', manualHours: 390, automatedHours: 195, costSavingsUSD: 15210, tokenCount: 820000 },
    { month: 'Jul', manualHours: 340, automatedHours: 290, costSavingsUSD: 22620, tokenCount: 1250000 },
    { month: 'Aug', manualHours: 280, automatedHours: 380, costSavingsUSD: 29640, tokenCount: 1680000 },
    { month: 'Sep', manualHours: 210, automatedHours: 490, costSavingsUSD: 38220, tokenCount: 2100000 },
    { month: 'Oct', manualHours: 140, automatedHours: 620, costSavingsUSD: 48360, tokenCount: 2489000 },
  ];

  const departmentEfficiency = [
    { department: 'Finance', automatedPct: 78, humanReviewPct: 22, avgLatencySec: 4.2 },
    { department: 'Operations', automatedPct: 91, humanReviewPct: 9, avgLatencySec: 1.8 },
    { department: 'HR', automatedPct: 65, humanReviewPct: 35, avgLatencySec: 6.5 },
    { department: 'Sales', automatedPct: 83, humanReviewPct: 17, avgLatencySec: 3.1 },
    { department: 'IT Support', automatedPct: 88, humanReviewPct: 12, avgLatencySec: 2.4 },
  ];

  const errorRateTrends = [
    { day: 'Mon', errorRate: 0.8, autonomousCorrections: 42 },
    { day: 'Tue', errorRate: 0.5, autonomousCorrections: 38 },
    { day: 'Wed', errorRate: 1.2, autonomousCorrections: 61 },
    { day: 'Thu', errorRate: 0.4, autonomousCorrections: 29 },
    { day: 'Fri', errorRate: 0.6, autonomousCorrections: 35 },
    { day: 'Sat', errorRate: 0.2, autonomousCorrections: 12 },
    { day: 'Sun', errorRate: 0.1, autonomousCorrections: 8 },
  ];

  return res.json({
    monthlyTrends,
    departmentEfficiency,
    errorRateTrends,
    slaCompliancePct: 99.4,
    meanTimeToResolveHours: 0.38,
    totalAutonomouslyResolvedTickets: 1248,
  });
});
