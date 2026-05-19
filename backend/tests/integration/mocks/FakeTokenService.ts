import { ITokenService, TokenPayload } from '../../../src/domain/ports/ITokenService';

export class FakeTokenService implements ITokenService {
  private accessTokenCounter = 0;
  private refreshTokenCounter = 0;

  generateAccessToken(payload: TokenPayload): string {
    this.accessTokenCounter++;
    return `fake-access-token-${this.accessTokenCounter}-${payload.userId}`;
  }

  generateRefreshToken(payload: TokenPayload): string {
    this.refreshTokenCounter++;
    return `fake-refresh-token-${this.refreshTokenCounter}-${payload.userId}`;
  }

  verifyAccessToken(token: string): TokenPayload {
    if (!token.startsWith('fake-access-token-')) {
      throw new Error('Invalid access token');
    }
    const userId = token.split('-').pop()!;
    return { userId, email: `${userId}@test.com` };
  }

  verifyRefreshToken(token: string): TokenPayload {
    if (!token.startsWith('fake-refresh-token-')) {
      throw new Error('Invalid refresh token');
    }
    const userId = token.split('-').pop()!;
    return { userId, email: `${userId}@test.com` };
  }
}
