import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../../shared/env';
import { logger } from '../../shared/logger';
import { createContainer } from '../container';
import { createAuthMiddleware } from './middleware/authMiddleware';
import { generalRateLimit } from './middleware/rateLimitMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { createAuthRoutes } from './routes/authRoutes';
import { createCircleRoutes } from './routes/circleRoutes';
import { createLocationRoutes } from './routes/locationRoutes';
import { createZoneRoutes } from './routes/zoneRoutes';
import { createPrivacyRoutes } from './routes/privacyRoutes';
import { startCronJobs } from '../cron/cronJobs';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/ws',
});

// Create DI container
const container = createContainer(io);

// Global middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(generalRateLimit);

// Auth middleware factory
const authMiddleware = createAuthMiddleware(container.tokenService);

// Health check (public)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/v1/auth', createAuthRoutes(
  container.registerUserUseCase,
  container.loginUserUseCase,
  container.refreshTokenUseCase,
  container.logoutUseCase,
));

// Protected routes
app.use('/api/v1/circles', authMiddleware, createCircleRoutes(
  container.createCircleUseCase,
  container.inviteMemberUseCase,
  container.acceptInvitationUseCase,
  container.dissolveCircleUseCase,
  container.removeMemberUseCase,
  container.updateMemberRoleUseCase,
  container.updateDailyLimitsUseCase,
));

app.use('/api/v1/locations', authMiddleware, createLocationRoutes(
  container.shareLocationUseCase,
  container.getCircleLocationsUseCase,
));

app.use('/api/v1/zones', authMiddleware, createZoneRoutes(
  container.createZoneUseCase,
  container.updateZoneUseCase,
  container.deleteZoneUseCase,
  container.getZonesByCircleUseCase,
));

app.use('/api/v1/privacy', authMiddleware, createPrivacyRoutes(
  container.activatePrivacyModeUseCase,
  container.deactivatePrivacyModeUseCase,
));

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.debug({ socketId: socket.id }, 'Client connected');

  socket.on('join:circle', (circleId: string) => {
    socket.join(`circle:${circleId}`);
    logger.debug({ socketId: socket.id, circleId }, 'Client joined circle room');
  });

  socket.on('leave:circle', (circleId: string) => {
    socket.leave(`circle:${circleId}`);
  });

  socket.on('disconnect', () => {
    logger.debug({ socketId: socket.id }, 'Client disconnected');
  });
});

// Start server
const PORT = env.PORT;

httpServer.listen(PORT, () => {
  logger.info(`FamilyLink backend running on port ${PORT}`);
  startCronJobs(container.locationRepo, container.invitationRepo);
});

export { app, httpServer, io };
