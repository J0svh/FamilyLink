import { Router } from 'express';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { loginRateLimit } from '../middleware/rateLimitMiddleware';
import { prisma } from '../../persistence/PrismaClient';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(1).max(50),
    password: z.string().min(8).max(128),
    language: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export function createAuthRoutes(
  registerUseCase: RegisterUserUseCase,
  loginUseCase: LoginUserUseCase,
  refreshTokenUseCase: RefreshTokenUseCase,
  logoutUseCase: LogoutUseCase,
): Router {
  const router = Router();

  router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
    const result = await registerUseCase.execute(req.body);
    res.status(201).json(result);
  }));

  router.post('/login', loginRateLimit, validate(loginSchema), asyncHandler(async (req, res) => {
    const result = await loginUseCase.execute(req.body);
    res.json(result);
  }));

  router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
    const result = await refreshTokenUseCase.execute(req.body);
    res.json(result);
  }));

  router.post('/logout', validate(logoutSchema), asyncHandler(async (req, res) => {
    await logoutUseCase.execute(req.body);
    res.status(204).send();
  }));

  // Profile update (avatar, username, language)
  router.patch('/profile', asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { avatarId, username, language } = req.body;
    const updateData: any = {};
    if (avatarId) updateData.avatarId = avatarId;
    if (username) updateData.username = username;
    if (language) updateData.language = language;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({ success: true, ...updateData });
  }));

  // Forgot password — generates reset link (logged to console in dev)
  router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (user) {
      // Generate a simple reset token (in production, use crypto.randomBytes)
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // In development, log to console. In production, send via Resend.
      console.log('\n========================================');
      console.log('🔑 PASSWORD RESET LINK:');
      console.log(resetLink);
      console.log('========================================\n');
    }

    // Always return 200 to prevent email enumeration
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  }));

  // Search users by username or email
  router.get('/search', asyncHandler(async (req, res) => {
    const q = (req.query.q as string || '').trim();
    if (q.length < 2) return res.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, email: true },
      take: 10,
    });

    res.json({
      users: users.map(u => ({
        userId: u.id,
        username: u.username,
        email: u.email,
        avatarId: null,
      })),
    });
  }));

  return router;
}
