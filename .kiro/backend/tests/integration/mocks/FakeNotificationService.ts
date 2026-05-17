import { INotificationService, NotificationPayload, EmailTemplate } from '../../../src/domain/ports/INotificationService';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { UserId } from '../../../src/domain/value-objects/UserId';

export class FakeNotificationService implements INotificationService {
  public pushNotifications: { circleId: string; payload: NotificationPayload }[] = [];
  public emails: { userId: string; template: EmailTemplate }[] = [];

  async sendPushToCircle(circleId: CircleId, payload: NotificationPayload): Promise<void> {
    this.pushNotifications.push({ circleId: circleId.getValue(), payload });
  }

  async sendEmailToUser(userId: UserId, template: EmailTemplate): Promise<void> {
    this.emails.push({ userId: userId.getValue(), template });
  }

  clear(): void {
    this.pushNotifications = [];
    this.emails = [];
  }
}
