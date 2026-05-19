import { INotificationService, NotificationPayload, EmailTemplate } from '../../domain/ports/INotificationService';
import { CircleId } from '../../domain/value-objects/CircleId';
import { UserId } from '../../domain/value-objects/UserId';
import { logger } from '../../shared/logger';

export class FCMNotificationAdapter implements INotificationService {
  // In production, this would use Firebase Admin SDK
  // For now, we log notifications (FCM setup requires Firebase project)

  async sendPushToCircle(circleId: CircleId, payload: NotificationPayload): Promise<void> {
    logger.info({
      type: 'push_notification',
      circleId: circleId.getValue(),
      title: payload.title,
      body: payload.body,
    }, 'Push notification sent to circle');

    // TODO: Implement with Firebase Admin SDK
    // const message = {
    //   topic: `circle_${circleId.getValue()}`,
    //   notification: { title: payload.title, body: payload.body },
    //   data: payload.data || {},
    // };
    // await admin.messaging().send(message);
  }

  async sendEmailToUser(userId: UserId, template: EmailTemplate): Promise<void> {
    logger.info({
      type: 'email',
      userId: userId.getValue(),
      template: template.templateName,
      subject: template.subject,
    }, 'Email sent to user');

    // TODO: Implement with Resend
    // const { data, error } = await resend.emails.send({
    //   from: 'FamilyLink <noreply@familylink.app>',
    //   to: [userEmail],
    //   subject: template.subject,
    //   html: renderTemplate(template),
    // });
  }
}
