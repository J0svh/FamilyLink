import jwt, { SignOptions } from 'jsonwebtoken';

import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';
import { env } from '../../shared/env';

export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload as object, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload as object, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as Record<string, unknown>;
    return { userId: decoded.userId as string, email: decoded.email as string };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as Record<string, unknown>;
    return { userId: decoded.userId as string, email: decoded.email as string };
  }
}