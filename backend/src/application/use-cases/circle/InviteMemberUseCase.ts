import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IInvitationRepository } from '../../../domain/ports/IInvitationRepository';
import { IEventPublisher } from '../../../domain/ports/IEventPublisher';
import { Invitation } from '../../../domain/entities/Invitation';
import { InvitationId } from '../../../domain/value-objects/InvitationId';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { MemberInvited } from '../../../domain/events/MemberInvited';
import { InviteMemberInputDTO, InviteMemberOutputDTO } from '../../dtos/circle/InviteMemberDTO';
import { AppError } from '../../../shared/AppError';

export class InviteMemberUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly invitationRepo: IInvitationRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: InviteMemberInputDTO): Promise<InviteMemberOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const invitedBy = UserId.create(dto.invitedByUserId);
    const email = Email.create(dto.email);

    // Find circle
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    // Verify requester is admin
    if (!circle.isAdmin(invitedBy)) {
      throw AppError.forbidden('Only circle admins can invite members');
    }

    // Check if email is already a member (by checking pending invitations)
    const pendingInvitations = await this.invitationRepo.findPendingByEmail(email);
    const alreadyInvitedToThisCircle = pendingInvitations.some(
      inv => inv.getCircleId().equals(circleId),
    );
    if (alreadyInvitedToThisCircle) {
      throw AppError.conflict('User already has a pending invitation to this circle');
    }

    // Create invitation (expires in 7 days)
    const invitationId = InvitationId.create();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = Invitation.create({
      id: invitationId,
      circleId,
      invitedBy,
      email,
      expiresAt,
    });

    // Persist
    await this.invitationRepo.save(invitation);

    // Publish event
    await this.eventPublisher.publish(new MemberInvited(circleId, email, invitationId));

    return {
      invitationId: invitationId.getValue(),
      email: email.getValue(),
      expiresAt,
    };
  }
}
