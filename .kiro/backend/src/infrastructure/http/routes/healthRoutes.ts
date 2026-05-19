import { Router } from 'express';
import { prisma } from '../../persistence/PrismaClient';
import { logger } from '../../../shared/logger';
import { metricsService } from '../../metrics/metricsService';

export function createHealthRoutes(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const checks = {
      db: false,
      cache: true, // Assume OK if no Redis configured (graceful fallback)
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = true;
    } catch (error) {
      logger.error({ error }, 'Health check: DB connection failed');
    }

    const status = checks.db ? 'ok' : 'degraded';

    res.status(checks.db ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      db: checks.db,
      cache: checks.cache,
      uptime: process.uptime(),
    });
  });

  router.get('/metrics', (_req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(metricsService.getMetrics());
  });

  return router;
}
