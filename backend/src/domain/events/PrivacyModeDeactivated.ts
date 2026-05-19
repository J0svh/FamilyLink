import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';

export class PrivacyModeDeactivated extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly circleId: CircleId,
    public readonly timestamp: Date,
  ) {
    super();
  }

  get eventName(): string {
    return 'PrivacyModeDeactivated';
  }
}
