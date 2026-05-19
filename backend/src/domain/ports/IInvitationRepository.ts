import { Invitation } from '../entities/Invitation';
import { InvitationId } from '../value-objects/InvitationId';
import { CircleId } from '../value-objects/CircleId';
import { Email } from '../value-objects/Email';

export interface IInvitationRepository {
  findById(id: InvitationId): Promise<Invitation | null>;
  findPendingByCircleId(circleId: CircleId): Promise<Invitation[]>;
  findPendingByEmail(email: Email): Promise<Invitation[]>;
  save(invitation: Invitation): Promise<void>;
  invalidate(id: InvitationId): Promise<void>;
}
