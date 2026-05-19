import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';
import { Coordinates } from '../value-objects/Coordinates';

import { DomainEvent } from './DomainEvent';

export class LocationShared extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly circleId: CircleId,
    public readonly coordinates: Coordinates,
    public readonly capturedAt: Date,
  ) {
    super();
  }

  get eventName(): string {
    return 'LocationShared';
  }
}