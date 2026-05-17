import { prisma } from './PrismaClient';
import { IRefreshTokenRepository, RefreshTokenEntity } from '../../domain/ports/IRefreshTokenRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { v4 as uuidv4 } from 'uuid';

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  async save(userId: UserId, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        userId: userId.getValue(),
        token,
        expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      token: record.token,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      revokedAt: record.revokedAt,
    };
  }

  async revoke(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: UserId): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId: userId.getValue(),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
