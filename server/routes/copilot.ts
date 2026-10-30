import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { queryEnterpriseCopilot } from '../gemini.js';

export const copilotRouter = Router();

copilotRouter.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    const workflows = db.getWorkflows(req.user);
    const documents = db.getDocuments(req.user);

    const contextData = {
      activeWorkflowsCount: workflows.filter((w) => w.is_active).length,
      userRole: req.user.role,
      userName: req.user.name,
      department: req.user.department,
      recentDocuments: documents.slice(0, 3).map((d) => ({
        title: d.title,
        type: d.extracted_data?.documentType,
        risk: d.extracted_data?.riskScore,
      })),
    };

    const formattedHistory = Array.isArray(history)
      ? history.map((h: any) => ({
          role: h.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: h.content || h.text || '' }],
        }))
      : [];

    const result = await queryEnterpriseCopilot(message, formattedHistory, contextData);

    db.recordAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      department: req.user.department,
      action: 'COPILOT_QUERY',
      module: 'AI Command Center',
      details: {
        intent: result.detectedIntent,
        querySnippet: message.slice(0, 60),
      },
      ip_address: req.ip || '127.0.0.1',
    });

    return res.json({
      reply: result.reply,
      intent: result.detectedIntent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return res.status(500).json({ error: 'Failed to process copilot query' });
  }
});
