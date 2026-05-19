import { prisma } from './PrismaClient';
import { IInvitationRepository } from '../../domain/ports/IInvitationRepository';
import { Invitation, InvitationStatus } from '../../domain/entities/Invitation';
import { InvitationId } from '../../domain/value-objects/InvitationId';
import { CircleId } from '../../domain/value-objects/CircleId';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

function mapStatus(dbStatus: string): InvitationStatus {
  switch (dbStatus) {
    case 'pending': return InvitationStatus.PENDING;
    case 'accepted': return InvitationStatus.ACCEPTED;
    case 'expired': return InvitationStatus.EXPIRED;
    case 'revoked':
    case 'cancelled': return InvitationStatus.CANCELLED;
    default: return InvitationStatus.PENDING;
  }
}

function toDbStatus(status: InvitationStatus): string {
  switch (status) {
    case InvitationStatus.PENDING: return 'pending';
    case InvitationStatus.ACCEPTED: return 'accepted';
    case InvitationStatus.EXPIRED: return 'expired';
    case InvitationStatus.CANCELLED: return 'revoked';
  }
}

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
        status: 'pending',
      },
    });

    return records.map(r => this.toDomain(r));
  }

  async findPendingByEmail(email: Email): Promise<Invitation[]> {
    const records = await prisma.invitation.findMany({
      where: {
        email: email.getValue(),
        status: 'pending',
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
      status: toDbStatus(invitation.getStatus()),
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
      data: { status: 'revoked' },
    });
  }

  private toDomain(record: any): Invitation {
    return Invitation.create({
      id: InvitationId.create(record.id),
      circleId: CircleId.create(record.circleId),
      invitedBy: UserId.create(record.invitedBy),
      email: Email.create(record.email),
      status: mapStatus(record.status),
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }
}
