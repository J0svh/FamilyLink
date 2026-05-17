import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor() {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
  }

  abstract get eventName(): string;
}
