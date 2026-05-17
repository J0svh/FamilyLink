import { Server as SocketIOServer } from 'socket.io';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { LocationShared } from '../../domain/events/LocationShared';
import { ZoneEntered } from '../../domain/events/ZoneEntered';
import { ZoneExited } from '../../domain/events/ZoneExited';
import { PrivacyModeActivated } from '../../domain/events/PrivacyModeActivated';
import { PrivacyModeDeactivated } from '../../domain/events/PrivacyModeDeactivated';
import { CircleCreated } from '../../domain/events/CircleCreated';
import { MemberInvited } from '../../domain/events/MemberInvited';
import { logger } from '../../shared/logger';

export class SocketIOEventPublisher implements IEventPublisher {
  constructor(private readonly io: SocketIOServer | null) {}

  async publish(event: DomainEvent): Promise<void> {
    if (!this.io) {
      logger.debug({ eventName: event.eventName }, 'Socket.IO not available, event not emitted');
      return;
    }

    try {
      const { room, eventType, payload } = this.mapEvent(event);

      if (room && eventType) {
        this.io.to(room).emit(eventType, payload);
        logger.debug({ eventName: event.eventName, room, eventType }, 'Event emitted via Socket.IO');
      }
    } catch (error) {
      logger.error({ error, eventName: event.eventName }, 'Failed to publish event via Socket.IO');
    }
  }

  private mapEvent(event: DomainEvent): { room: string | null; eventType: string | null; payload: any } {
    if (event instanceof LocationShared) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'location:updated',
        payload: {
          userId: event.userId.getValue(),
          coordinates: event.coordinates.toJSON(),
          capturedAt: event.capturedAt.toISOString(),
        },
      };
    }

    if (event instanceof ZoneEntered) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'zone:entered',
        payload: {
          userId: event.userId.getValue(),
          zoneId: event.zoneId.getValue(),
          timestamp: event.timestamp.toISOString(),
        },
      };
    }

    if (event instanceof ZoneExited) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'zone:exited',
        payload: {
          userId: event.userId.getValue(),
          zoneId: event.zoneId.getValue(),
          timestamp: event.timestamp.toISOString(),
        },
      };
    }

    if (event instanceof PrivacyModeActivated) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'privacy:activated',
        payload: {
          userId: event.userId.getValue(),
          expiresAt: event.expiresAt.toISOString(),
        },
      };
    }

    if (event instanceof PrivacyModeDeactivated) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'privacy:deactivated',
        payload: {
          userId: event.userId.getValue(),
          timestamp: event.timestamp.toISOString(),
        },
      };
    }

    if (event instanceof CircleCreated) {
      return {
        room: null,
        eventType: null,
        payload: null,
      };
    }

    if (event instanceof MemberInvited) {
      return {
        room: `circle:${event.circleId.getValue()}`,
        eventType: 'member:invited',
        payload: {
          email: event.email.getValue(),
          invitationId: event.invitationId.getValue(),
        },
      };
    }

    logger.warn({ eventName: event.eventName }, 'Unknown event type, not emitted');
    return { room: null, eventType: null, payload: null };
  }
}
