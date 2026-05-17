import { IRefreshTokenRepository, RefreshTokenEntity } from '../../../src/domain/ports/IRefreshTokenRepository';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  private tokens: Map<string, RefreshTokenEntity> = new Map();

  async save(userId: UserId, token: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, {
      id: uuidv4(),
      userId: userId.getValue(),
      token,
      expiresAt,
      createdAt: new Date(),
      revokedAt: null,
    });
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.tokens.get(token) ?? null;
  }

  async revoke(token: string): Promise<void> {
    const entity = this.tokens.get(token);
    if (entity) {
      entity.revokedAt = new Date();
    }
  }

  async revokeAllByUserId(userId: UserId): Promise<void> {
    for (const entity of this.tokens.values()) {
      if (entity.userId === userId.getValue()) {
        entity.revokedAt = new Date();
      }
    }
  }

  clear(): void {
    this.tokens.clear();
  }
}
