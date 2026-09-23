import express, { type Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { createLeadRouter } from './routes/lead.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  // Root info route
  app.get('/', (_req, res) => {
    res.json({
      name: 'Lead Tracker API',
      version: '1.0.0',
      status: 'running',
      health: '/health',
    });
  });

  // Health check route
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/leads', createLeadRouter());

  // 404 handler for unmatched routes
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
