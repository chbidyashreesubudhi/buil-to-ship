import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { dashboardRouter } from './server/routes/dashboard.js';
import { workflowsRouter } from './server/routes/workflows.js';
import { documentsRouter } from './server/routes/documents.js';
import { copilotRouter } from './server/routes/copilot.js';
import { auditLogsRouter } from './server/routes/auditLogs.js';
import { analyticsRouter } from './server/routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import { testPostgresConnection } from './server/postgres.js';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Nexus-AI Enterprise Core',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Database diagnostics
app.get('/api/database/status', async (req, res) => {
  const status = await testPostgresConnection();
  res.json({
    status,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/ai/copilot', copilotRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/analytics', analyticsRouter);

// Start server with Vite middleware in dev or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nexus-AI] Enterprise Core operational at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Nexus-AI] Fatal server startup error:', err);
});
