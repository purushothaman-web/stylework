import express, { type Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { createLeadRouter } from './routes/lead.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  // Health check route
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/leads', createLeadRouter());

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
