import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';

import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/errors/AppError';

export function createApp(): Application {
  const app = express();

  // ── Security headers ──────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
          connectSrc: ["'self'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true },
    }),
  );

  // ── CORS ──────────────────────────────────────────
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  // ── Body parsing & compression ────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // ── Health check ──────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes (placeholder — se añadirán en Task 4.6) ──
  app.use('/api/v1', (_req: Request, res: Response) => {
    res.json({ message: 'FamilyLink API v1' });
  });

  // ── 404 handler ───────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found', statusCode: 404 });
  });

  // ── Global error handler ──────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      logger.warn({ err }, 'Operational error');
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
        statusCode: err.statusCode,
      });
    }

    logger.error({ err }, 'Unexpected error');
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });

  return app;
}

export function createHttpServer(app: Application) {
  return createServer(app);
}
