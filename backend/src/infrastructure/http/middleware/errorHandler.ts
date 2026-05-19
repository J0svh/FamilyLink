import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/AppError';
import { logger } from '../../../shared/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Unexpected errors
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}
