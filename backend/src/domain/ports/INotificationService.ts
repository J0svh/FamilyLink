import { CircleId } from '../value-objects/CircleId';
import { UserId } from '../value-objects/UserId';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface EmailTemplate {
  templateName: string;
  subject: string;
  data: Record<string, unknown>;
}

export interface INotificationService {
  sendPushToCircle(circleId: CircleId, payload: NotificationPayload): Promise<void>;
  sendEmailToUser(userId: UserId, template: EmailTemplate): Promise<void>;
}
