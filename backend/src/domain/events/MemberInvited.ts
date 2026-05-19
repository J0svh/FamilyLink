import { DomainEvent } from './DomainEvent';
import { CircleId } from '../value-objects/CircleId';
import { Email } from '../value-objects/Email';
import { InvitationId } from '../value-objects/InvitationId';

export class MemberInvited extends DomainEvent {
  constructor(
    public readonly circleId: CircleId,
    public readonly email: Email,
    public readonly invitationId: InvitationId,
  ) {
    super();
  }

  get eventName(): string {
    return 'MemberInvited';
  }
}
