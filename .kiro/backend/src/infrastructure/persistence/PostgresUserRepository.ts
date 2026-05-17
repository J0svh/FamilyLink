import { prisma } from './PrismaClient';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/aggregates/user/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

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
    const data = {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      username: user.getUsername(),
      passwordHash: user.getPasswordHash(),
      language: user.getLanguage(),
    };

    await prisma.user.upsert({
      where: { id: data.id },
      update: data,
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
