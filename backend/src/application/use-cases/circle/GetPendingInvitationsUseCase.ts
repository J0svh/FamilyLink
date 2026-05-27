import { IInvitationRepository } from '../../../domain/ports/IInvitationRepository';
import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';

export interface PendingInvitationDTO {
  invitationId: string;
  circleId: string;
  circleName: string;
  invitedByUsername: string;
  createdAt: string;
}

export class GetPendingInvitationsUseCase {
  constructor(
    private readonly invitationRepo: IInvitationRepository,
    private readonly circleRepo: ICircleRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<PendingInvitationDTO[]> {
    // Get user email to find invitations (invitations use email, not userId)
    const user = await this.userRepo.findById(UserId.create(userId));
    if (!user) return [];

    const invitations = await this.invitationRepo.findPendingByEmail(user.getEmail());

    const results: PendingInvitationDTO[] = [];
    for (const inv of invitations) {
      const circle = await this.circleRepo.findById(inv.getCircleId());
      const inviter = await this.userRepo.findById(inv.getInvitedBy());

      results.push({
        invitationId: inv.getId().getValue(),
        circleId: inv.getCircleId().getValue(),
        circleName: circle?.getName() ?? 'Desconocido',
        invitedByUsername: inviter?.getUsername() ?? 'Desconocido',
        createdAt: inv.getCreatedAt().toISOString(),
      });
    }

    return results;
  }
}
