import { Request, Response, NextFunction } from 'express';
import { metricsService } from './metricsService';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.route?.path || req.path;

    metricsService.trackHttpRequest(req.method, path, res.statusCode);

    // Track 5xx errors
    if (res.statusCode >= 500) {
      metricsService.trackError('5xx');
    }
  });

  next();
}
