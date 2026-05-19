import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { RemoveMemberInputDTO } from '../../dtos/circle/RemoveMemberDTO';
import { AppError } from '../../../shared/AppError';

export class RemoveMemberUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
  ) {}

  async execute(dto: RemoveMemberInputDTO): Promise<void> {
    const circleId = CircleId.create(dto.circleId);
    const requestingUserId = UserId.create(dto.requestingUserId);
    const targetUserId = UserId.create(dto.targetUserId);

    // Find circle
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    // Verify requester is admin
    if (!circle.isAdmin(requestingUserId)) {
      throw AppError.forbidden('Only circle admins can remove members');
    }

    // Cannot remove yourself via this use case
    if (requestingUserId.equals(targetUserId)) {
      throw AppError.badRequest('Cannot remove yourself. Use leave circle instead.');
    }

    // Remove member (domain validates last admin constraint)
    circle.removeMember(targetUserId);

    // Persist
    await this.circleRepo.save(circle);
  }
}
