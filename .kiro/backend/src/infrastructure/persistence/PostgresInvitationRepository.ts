import { prisma } from './PrismaClient';
import { IInvitationRepository } from '../../domain/ports/IInvitationRepository';
import { Invitation, InvitationStatus } from '../../domain/entities/Invitation';
import { InvitationId } from '../../domain/value-objects/InvitationId';
import { CircleId } from '../../domain/value-objects/CircleId';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

export class PostgresInvitationRepository implements IInvitationRepository {
  async findById(id: InvitationId): Promise<Invitation | null> {
    const record = await prisma.invitation.findUnique({
      where: { id: id.getValue() },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findPendingByCircleId(circleId: CircleId): Promise<Invitation[]> {
    const records = await prisma.invitation.findMany({
      where: {
        circleId: circleId.getValue(),
        status: 'PENDING',
      },
    });

    return records.map(r => this.toDomain(r));
  }

  async findPendingByEmail(email: Email): Promise<Invitation[]> {
    const records = await prisma.invitation.findMany({
      where: {
        email: email.getValue(),
        status: 'PENDING',
      },
    });

    return records.map(r => this.toDomain(r));
  }

  async save(invitation: Invitation): Promise<void> {
    const data = {
      id: invitation.getId().getValue(),
      circleId: invitation.getCircleId().getValue(),
      invitedBy: invitation.getInvitedBy().getValue(),
      email: invitation.getEmail().getValue(),
      status: invitation.getStatus() as any,
      expiresAt: invitation.getExpiresAt(),
    };

    await prisma.invitation.upsert({
      where: { id: data.id },
      update: { status: data.status },
      create: data,
    });
  }

  async invalidate(id: InvitationId): Promise<void> {
    await prisma.invitation.update({
      where: { id: id.getValue() },
      data: { status: 'CANCELLED' },
    });
  }

  private toDomain(record: any): Invitation {
    return Invitation.create({
      id: InvitationId.create(record.id),
      circleId: CircleId.create(record.circleId),
      invitedBy: UserId.create(record.invitedBy),
      email: Email.create(record.email),
      status: record.status as InvitationStatus,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }
}
