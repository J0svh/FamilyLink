import { TokenPayload } from '../domain/ports/ITokenService';

declare global {
  namespace Express {
    interface User extends TokenPayload {}
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
