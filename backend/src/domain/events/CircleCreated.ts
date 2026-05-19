import { CircleId } from '../value-objects/CircleId';
import { UserId } from '../value-objects/UserId';

import { DomainEvent } from './DomainEvent';

export class CircleCreated extends DomainEvent {
  constructor(
    public readonly circleId: CircleId,
    public readonly createdBy: UserId,
  ) {
    super();
  }

  get eventName(): string {
    return 'CircleCreated';
  }
}