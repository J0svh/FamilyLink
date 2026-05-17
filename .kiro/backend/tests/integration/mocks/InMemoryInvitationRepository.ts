import { IInvitationRepository } from '../../../src/domain/ports/IInvitationRepository';
import { Invitation } from '../../../src/domain/entities/Invitation';
import { InvitationId } from '../../../src/domain/value-objects/InvitationId';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { Email } from '../../../src/domain/value-objects/Email';
import { InvitationStatus } from '../../../src/domain/entities/Invitation';

export class InMemoryInvitationRepository implements IInvitationRepository {
  private invitations: Map<string, Invitation> = new Map();

  async findById(id: InvitationId): Promise<Invitation | null> {
    return this.invitations.get(id.getValue()) ?? null;
  }

  async findPendingByCircleId(circleId: CircleId): Promise<Invitation[]> {
    const result: Invitation[] = [];
    for (const inv of this.invitations.values()) {
      if (inv.getCircleId().equals(circleId) && inv.isPending()) {
        result.push(inv);
      }
    }
    return result;
  }

  async findPendingByEmail(email: Email): Promise<Invitation[]> {
    const result: Invitation[] = [];
    for (const inv of this.invitations.values()) {
      if (inv.getEmail().equals(email) && inv.isPending()) {
        result.push(inv);
      }
    }
    return result;
  }

  async save(invitation: Invitation): Promise<void> {
    this.invitations.set(invitation.getId().getValue(), invitation);
  }

  async invalidate(id: InvitationId): Promise<void> {
    const inv = this.invitations.get(id.getValue());
    if (inv) {
      inv.cancel();
    }
  }

  clear(): void {
    this.invitations.clear();
  }
}
