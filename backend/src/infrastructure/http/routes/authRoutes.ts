import { Router } from 'express';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { loginRateLimit } from '../middleware/rateLimitMiddleware';

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

  return router;
}
