import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IEventPublisher } from '../../../domain/ports/IEventPublisher';
import { UserId } from '../../../domain/value-objects/UserId';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { ActivatePrivacyInputDTO, ActivatePrivacyOutputDTO } from '../../dtos/privacy/ActivatePrivacyDTO';
import { AppError } from '../../../shared/AppError';

export class ActivatePrivacyModeUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly circleRepo: ICircleRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: ActivatePrivacyInputDTO): Promise<ActivatePrivacyOutputDTO> {
    const userId = UserId.create(dto.userId);
    const circleId = CircleId.create(dto.circleId);

    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify circle exists and user is a member
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }
    if (!circle.isMember(userId)) {
      throw AppError.forbidden('User is not a member of this circle');
    }

    // Activate privacy mode (domain validates duration and daily limit)
    user.activatePrivacyMode(circleId, dto.durationMinutes);

    // Persist user state
    await this.userRepo.save(user);

    // Publish domain events
    for (const event of user.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    user.clearDomainEvents();

    const privacyState = user.getPrivacyMode();

    return {
      expiresAt: privacyState.expiresAt!,
      activationsRemaining: user.getPrivacyActivationsRemaining(),
    };
  }
}
