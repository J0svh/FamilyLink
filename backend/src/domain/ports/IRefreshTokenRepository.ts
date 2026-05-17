import { UserId } from '../value-objects/UserId';

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface IRefreshTokenRepository {
  save(userId: UserId, token: string, expiresAt: Date): Promise<void>;
  findByToken(token: string): Promise<RefreshTokenEntity | null>;
  revoke(token: string): Promise<void>;
  revokeAllByUserId(userId: UserId): Promise<void>;
}
