import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { createLeadRouter } from './routes/lead.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS
  app.use(cors({ origin: config.clientOrigin }));

  // Global Rate Limiter for API routes (300 requests per 15 minutes per IP)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  });
  app.use('/api', apiLimiter);

  // Body parser with 50kb payload cap
  app.use(express.json({ limit: '50kb' }));

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
