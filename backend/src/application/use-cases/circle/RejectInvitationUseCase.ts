import { IInvitationRepository } from '../../../domain/ports/IInvitationRepository';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { InvitationId } from '../../../domain/value-objects/InvitationId';
import { UserId } from '../../../domain/value-objects/UserId';
import { AppError } from '../../../shared/AppError';

export interface RejectInvitationInputDTO {
  invitationId: string;
  userId: string;
}

export class RejectInvitationUseCase {
  constructor(
    private readonly invitationRepo: IInvitationRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: RejectInvitationInputDTO): Promise<void> {
    const invitationId = InvitationId.create(dto.invitationId);
    const userId = UserId.create(dto.userId);

    const invitation = await this.invitationRepo.findById(invitationId);
    if (!invitation) {
      throw AppError.notFound('Invitation not found');
    }

    // Verify the requesting user's email matches the invitation email
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (invitation.getEmail().getValue() !== user.getEmail().getValue()) {
      throw AppError.forbidden('Not the recipient of this invitation');
    }

    if (!invitation.isPending()) {
      throw AppError.badRequest('Invitation is no longer pending');
    }

    // Cancel the invitation (reuse cancel method which sets status to CANCELLED)
    invitation.cancel();
    await this.invitationRepo.save(invitation);
  }
}
