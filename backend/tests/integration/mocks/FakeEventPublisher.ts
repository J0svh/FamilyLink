import { IEventPublisher } from '../../../src/domain/ports/IEventPublisher';
import { DomainEvent } from '../../../src/domain/events/DomainEvent';

export class FakeEventPublisher implements IEventPublisher {
  public publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }

  clear(): void {
    this.publishedEvents = [];
  }

  getEventsByName(name: string): DomainEvent[] {
    return this.publishedEvents.filter(e => e.eventName === name);
  }
}
