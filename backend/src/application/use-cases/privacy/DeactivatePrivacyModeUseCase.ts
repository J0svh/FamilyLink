import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { IEventPublisher } from '../../../domain/ports/IEventPublisher';
import { UserId } from '../../../domain/value-objects/UserId';
import { DeactivatePrivacyInputDTO } from '../../dtos/privacy/DeactivatePrivacyDTO';
import { AppError } from '../../../shared/AppError';

export class DeactivatePrivacyModeUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: DeactivatePrivacyInputDTO): Promise<void> {
    const userId = UserId.create(dto.userId);

    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Deactivate privacy mode (domain validates it's active)
    user.deactivatePrivacyMode();

    // Persist
    await this.userRepo.save(user);

    // Publish domain events
    for (const event of user.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    user.clearDomainEvents();
  }
}
