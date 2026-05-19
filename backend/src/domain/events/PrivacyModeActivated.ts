import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';

export class PrivacyModeActivated extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly circleId: CircleId,
    public readonly expiresAt: Date,
  ) {
    super();
  }

  get eventName(): string {
    return 'PrivacyModeActivated';
  }
}
