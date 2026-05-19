import { prisma } from './PrismaClient';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/aggregates/user/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { CircleId } from '../../domain/value-objects/CircleId';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async save(user: User): Promise<void> {
    const privacyMode = user.getPrivacyMode();

    const data = {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      username: user.getUsername(),
      passwordHash: user.getPasswordHash(),
      language: user.getLanguage(),
      privacyModeActive: privacyMode.active,
      privacyModeExpiresAt: privacyMode.expiresAt,
      privacyModeCountToday: privacyMode.activationsToday,
      privacyModeResetDate: privacyMode.activationsResetAt,
    };

    await prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        language: data.language,
        privacyModeActive: data.privacyModeActive,
        privacyModeExpiresAt: data.privacyModeExpiresAt,
        privacyModeCountToday: data.privacyModeCountToday,
        privacyModeResetDate: data.privacyModeResetDate,
      },
      create: data,
    });
  }

  async delete(id: UserId): Promise<void> {
    await prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomain(record: any): User {
    return User.create({
      id: UserId.create(record.id),
      email: Email.create(record.email),
      username: record.username,
      passwordHash: record.passwordHash,
      language: record.language,
      privacyMode: {
        active: record.privacyModeActive,
        circleId: null,
        expiresAt: record.privacyModeExpiresAt,
        activationsToday: record.privacyModeCountToday,
        activationsResetAt: record.privacyModeResetDate,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
