import { prisma } from './PrismaClient';
import { IRefreshTokenRepository, RefreshTokenEntity } from '../../domain/ports/IRefreshTokenRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  async save(userId: UserId, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        userId: userId.getValue(),
        tokenHash: hashToken(token),
        expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const hash = hashToken(token);
    const record = await prisma.refreshToken.findFirst({
      where: { tokenHash: hash },
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      token: hash,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      revokedAt: record.revoked ? (record.revokedAt || record.createdAt) : null,
    };
  }

  async revoke(token: string): Promise<void> {
    const hash = hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: UserId): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId: userId.getValue(),
        revoked: false,
      },
      data: { revoked: true, revokedAt: new Date() },
    });
  }
}
