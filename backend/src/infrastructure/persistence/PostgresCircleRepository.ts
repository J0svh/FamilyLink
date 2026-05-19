import { prisma } from './PrismaClient';
import { ICircleRepository } from '../../domain/ports/ICircleRepository';
import { Circle } from '../../domain/aggregates/circle/Circle';
import { CircleMember } from '../../domain/aggregates/circle/CircleMember';
import { CircleRole } from '../../domain/aggregates/circle/CircleRole';
import { CircleId } from '../../domain/value-objects/CircleId';
import { UserId } from '../../domain/value-objects/UserId';

export class PostgresCircleRepository implements ICircleRepository {
  async findById(id: CircleId): Promise<Circle | null> {
    const record = await prisma.circle.findUnique({
      where: { id: id.getValue() },
      include: { members: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByMemberId(userId: UserId): Promise<Circle[]> {
    const records = await prisma.circle.findMany({
      where: {
        members: { some: { userId: userId.getValue() } },
      },
      include: { members: true },
    });

    return records.map(r => this.toDomain(r));
  }

  async save(circle: Circle): Promise<void> {
    const circleData = {
      id: circle.getId().getValue(),
      name: circle.getName(),
      createdBy: circle.getCreatedBy().getValue(),
    };

    await prisma.$transaction(async (tx) => {
      await tx.circle.upsert({
        where: { id: circleData.id },
        update: { name: circleData.name },
        create: circleData,
      });

      // Sync members
      await tx.circleMember.deleteMany({
        where: { circleId: circleData.id },
      });

      const memberData = circle.getMembers().map(m => ({
        id: undefined as any,
        userId: m.getUserId().getValue(),
        circleId: circleData.id,
        role: m.getRole() === CircleRole.CIRCLE_ADMIN ? 'circle_admin' : 'circle_member',
        joinedAt: m.getJoinedAt(),
      }));

      for (const member of memberData) {
        await tx.circleMember.create({
          data: {
            userId: member.userId,
            circleId: member.circleId,
            role: member.role,
            joinedAt: member.joinedAt,
          },
        });
      }
    });
  }

  async delete(id: CircleId): Promise<void> {
    await prisma.circle.delete({
      where: { id: id.getValue() },
    });
  }

  async countByMemberId(userId: UserId): Promise<number> {
    return prisma.circleMember.count({
      where: { userId: userId.getValue() },
    });
  }

  private toDomain(record: any): Circle {
    const members = (record.members || []).map((m: any) =>
      new CircleMember({
        userId: UserId.create(m.userId),
        role: m.role === 'circle_admin' ? CircleRole.CIRCLE_ADMIN : CircleRole.CIRCLE_MEMBER,
        joinedAt: m.joinedAt,
      }),
    );

    return Circle.reconstitute({
      id: CircleId.create(record.id),
      name: record.name,
      createdBy: UserId.create(record.createdBy),
      members,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
