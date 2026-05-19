import { Request, Response, NextFunction } from 'express';
import { ITokenService, TokenPayload } from '../../../domain/ports/ITokenService';
import { AppError } from '../../../shared/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function createAuthMiddleware(tokenService: ITokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const payload = tokenService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch {
      throw AppError.unauthorized('Invalid or expired access token');
    }
  };
}
