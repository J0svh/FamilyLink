import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';
import { ZoneId } from '../value-objects/ZoneId';

export class ZoneExited extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly circleId: CircleId,
    public readonly zoneId: ZoneId,
    public readonly timestamp: Date,
  ) {
    super();
  }

  get eventName(): string {
    return 'ZoneExited';
  }
}
