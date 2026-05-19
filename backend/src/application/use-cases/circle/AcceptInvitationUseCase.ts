import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IInvitationRepository } from '../../../domain/ports/IInvitationRepository';
import { InvitationId } from '../../../domain/value-objects/InvitationId';
import { UserId } from '../../../domain/value-objects/UserId';
import { CircleRole } from '../../../domain/aggregates/circle/CircleRole';
import { AcceptInvitationInputDTO, AcceptInvitationOutputDTO } from '../../dtos/circle/AcceptInvitationDTO';
import { AppError } from '../../../shared/AppError';

export class AcceptInvitationUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(dto: AcceptInvitationInputDTO): Promise<AcceptInvitationOutputDTO> {
    const invitationId = InvitationId.create(dto.invitationId);
    const userId = UserId.create(dto.userId);

    // Find invitation
    const invitation = await this.invitationRepo.findById(invitationId);
    if (!invitation) {
      throw AppError.notFound('Invitation not found');
    }

    // Accept invitation (validates pending status and expiry)
    invitation.accept();

    // Find circle
    const circle = await this.circleRepo.findById(invitation.getCircleId());
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    // Check if user is already a member
    if (circle.isMember(userId)) {
      throw AppError.conflict('User is already a member of this circle');
    }

    // Add member to circle
    circle.addMember(userId, CircleRole.CIRCLE_MEMBER);

    // Persist changes
    await this.invitationRepo.save(invitation);
    await this.circleRepo.save(circle);

    return {
      circleId: circle.getId().getValue(),
      circleName: circle.getName(),
      role: 'CIRCLE_MEMBER',
    };
  }
}
