import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
import { createApp, createHttpServer } from './infrastructure/http/server';

const app = createApp();
const httpServer = createHttpServer(app);

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 FamilyLink backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
