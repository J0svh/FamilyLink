import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';
import { env } from '../../shared/env';

export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    return { userId: decoded.userId, email: decoded.email };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
    return { userId: decoded.userId, email: decoded.email };
  }
}
