import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IZoneRepository } from '../../../domain/ports/IZoneRepository';
import { IInvitationRepository } from '../../../domain/ports/IInvitationRepository';
import { INotificationService } from '../../../domain/ports/INotificationService';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DissolveCircleInputDTO } from '../../dtos/circle/DissolveCircleDTO';
import { AppError } from '../../../shared/AppError';

export class DissolveCircleUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly zoneRepo: IZoneRepository,
    private readonly invitationRepo: IInvitationRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: DissolveCircleInputDTO): Promise<void> {
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    // Find circle
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    // Verify requester is admin
    if (!circle.isAdmin(userId)) {
      throw AppError.forbidden('Only circle admins can dissolve a circle');
    }

    // Delete all zones
    const zones = await this.zoneRepo.findByCircleId(circleId);
    for (const zone of zones) {
      await this.zoneRepo.delete(zone.getId());
    }

    // Invalidate all pending invitations
    const pendingInvitations = await this.invitationRepo.findPendingByCircleId(circleId);
    for (const invitation of pendingInvitations) {
      await this.invitationRepo.invalidate(invitation.getId());
    }

    // Notify members
    await this.notificationService.sendPushToCircle(circleId, {
      title: 'Circle dissolved',
      body: `The circle "${circle.getName()}" has been dissolved.`,
    });

    // Delete circle
    await this.circleRepo.delete(circleId);
  }
}
