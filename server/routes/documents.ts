import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { extractDocumentIntelligence } from '../gemini.js';

export const documentsRouter = Router();

// GET /api/documents - List documents with RLS
documentsRouter.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const documents = await db.getDocumentsAsync(req.user);
  return res.json({ documents });
});

// POST /api/documents/upload - Ingest and parse document with Gemini
documentsRouter.post('/upload', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content, fileType } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Document title and content are required' });
  }

  try {
    // Invoke Gemini structured extraction
    const extractedData = await extractDocumentIntelligence(content, title);

    const docRecord = await db.createDocumentAsync({
      title,
      file_type: fileType || 'text/plain',
      storage_url: `/vault/${req.user.department.toLowerCase()}/${encodeURIComponent(title)}`,
      extracted_data: extractedData,
      status: 'processed',
      user: req.user,
    });

    return res.status(201).json({
      message: 'Document successfully parsed and indexed into enterprise repository',
      document: docRecord,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return res.status(500).json({ error: 'Document extraction pipeline encountered an error' });
  }
});
