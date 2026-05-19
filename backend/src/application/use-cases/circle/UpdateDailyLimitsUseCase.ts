import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DailyLimit } from '../../../domain/value-objects/DailyLimit';
import { UpdateDailyLimitsInputDTO } from '../../dtos/circle/UpdateDailyLimitsDTO';
import { AppError } from '../../../shared/AppError';

export interface IDailyLimitRepository {
  save(userId: UserId, circleId: CircleId, limit: number): Promise<void>;
  findByUserAndCircle(userId: UserId, circleId: CircleId): Promise<number | null>;
}

export class UpdateDailyLimitsUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly dailyLimitRepo: IDailyLimitRepository,
  ) {}

  async execute(dto: UpdateDailyLimitsInputDTO): Promise<void> {
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
      throw AppError.forbidden('Only circle admins can update daily limits');
    }

    // Verify target is a member
    if (!circle.isMember(targetUserId)) {
      throw AppError.badRequest('Target user is not a member of this circle');
    }

    // Validate limit value (domain validation via Value Object)
    DailyLimit.create(dto.limit); // throws if invalid

    // Persist
    await this.dailyLimitRepo.save(targetUserId, circleId, dto.limit);
  }
}
