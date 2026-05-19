import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAuthRoutes } from '../../../src/infrastructure/http/routes/authRoutes';
import { errorHandler } from '../../../src/infrastructure/http/middleware/errorHandler';
import { RegisterUserUseCase } from '../../../src/application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../src/application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../src/application/use-cases/auth/LogoutUseCase';
import { InMemoryUserRepository } from '../mocks/InMemoryUserRepository';
import { InMemoryRefreshTokenRepository } from '../mocks/InMemoryRefreshTokenRepository';
import { FakeTokenService } from '../mocks/FakeTokenService';
import { FakePasswordHasher } from '../mocks/FakePasswordHasher';

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    const userRepo = new InMemoryUserRepository();
    const refreshTokenRepo = new InMemoryRefreshTokenRepository();
    const tokenService = new FakeTokenService();
    const passwordHasher = new FakePasswordHasher();

    const registerUseCase = new RegisterUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
    const loginUseCase = new LoginUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
    const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepo, tokenService, userRepo);
    const logoutUseCase = new LogoutUseCase(refreshTokenRepo);

    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', createAuthRoutes(registerUseCase, loginUseCase, refreshTokenUseCase, logoutUseCase));
    app.use(errorHandler);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a user and return 201', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', username: 'testuser', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: 'short' });

      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'user1', password: 'password123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'user2', password: 'password456' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });
    });

    it('should login and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 204 on successful logout', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: 'password123' });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: registerRes.body.refreshToken });

      expect(res.status).toBe(204);
    });
  });
});
