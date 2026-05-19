import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../src/application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../src/application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../src/application/use-cases/auth/LogoutUseCase';
import { InMemoryUserRepository } from '../mocks/InMemoryUserRepository';
import { InMemoryRefreshTokenRepository } from '../mocks/InMemoryRefreshTokenRepository';
import { FakeTokenService } from '../mocks/FakeTokenService';
import { FakePasswordHasher } from '../mocks/FakePasswordHasher';

describe('Auth Use Cases', () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let tokenService: FakeTokenService;
  let passwordHasher: FakePasswordHasher;
  let registerUseCase: RegisterUserUseCase;
  let loginUseCase: LoginUserUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    tokenService = new FakeTokenService();
    passwordHasher = new FakePasswordHasher();
    registerUseCase = new RegisterUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
    loginUseCase = new LoginUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
    refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepo, tokenService, userRepo);
    logoutUseCase = new LogoutUseCase(refreshTokenRepo);
  });

  describe('RegisterUserUseCase', () => {
    it('should register a new user successfully', async () => {
      const result = await registerUseCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await registerUseCase.execute({
        email: 'test@example.com',
        username: 'user1',
        password: 'password123',
      });

      await expect(registerUseCase.execute({
        email: 'test@example.com',
        username: 'user2',
        password: 'password456',
      })).rejects.toThrow('already registered');
    });

    it('should reject short password', async () => {
      await expect(registerUseCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'short',
      })).rejects.toThrow('at least 8');
    });

    it('should reject invalid email', async () => {
      await expect(registerUseCase.execute({
        email: 'notanemail',
        username: 'testuser',
        password: 'password123',
      })).rejects.toThrow();
    });
  });

  describe('LoginUserUseCase', () => {
    beforeEach(async () => {
      await registerUseCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should login with correct credentials', async () => {
      const result = await loginUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await expect(loginUseCase.execute({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      await expect(loginUseCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('RefreshTokenUseCase', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await registerUseCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
      refreshToken = result.refreshToken;
    });

    it('should issue new tokens with valid refresh token', async () => {
      const result = await refreshTokenUseCase.execute({ refreshToken });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(refreshToken); // rotated
    });

    it('should reject revoked refresh token', async () => {
      await logoutUseCase.execute({ refreshToken });

      await expect(refreshTokenUseCase.execute({ refreshToken })).rejects.toThrow('revoked');
    });

    it('should reject invalid refresh token', async () => {
      await expect(refreshTokenUseCase.execute({
        refreshToken: 'invalid-token',
      })).rejects.toThrow();
    });
  });

  describe('LogoutUseCase', () => {
    it('should revoke refresh token', async () => {
      const result = await registerUseCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      await expect(logoutUseCase.execute({
        refreshToken: result.refreshToken,
      })).resolves.not.toThrow();
    });

    it('should reject empty refresh token', async () => {
      await expect(logoutUseCase.execute({
        refreshToken: '',
      })).rejects.toThrow('required');
    });
  });
});
