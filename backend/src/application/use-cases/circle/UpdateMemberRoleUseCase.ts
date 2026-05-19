import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { CircleRole } from '../../../domain/aggregates/circle/CircleRole';
import { UpdateMemberRoleInputDTO } from '../../dtos/circle/UpdateMemberRoleDTO';
import { AppError } from '../../../shared/AppError';

export class UpdateMemberRoleUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
  ) {}

  async execute(dto: UpdateMemberRoleInputDTO): Promise<void> {
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
      throw AppError.forbidden('Only circle admins can change member roles');
    }

    // Map string role to enum
    const newRole = dto.newRole === 'CIRCLE_ADMIN' ? CircleRole.CIRCLE_ADMIN : CircleRole.CIRCLE_MEMBER;

    // Update role (domain validates last admin constraint)
    circle.updateMemberRole(targetUserId, newRole);

    // Persist
    await this.circleRepo.save(circle);
  }
}
