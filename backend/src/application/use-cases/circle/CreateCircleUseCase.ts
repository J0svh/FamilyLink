import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IEventPublisher } from '../../../domain/ports/IEventPublisher';
import { Circle } from '../../../domain/aggregates/circle/Circle';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { CreateCircleInputDTO, CreateCircleOutputDTO } from '../../dtos/circle/CreateCircleDTO';
import { AppError } from '../../../shared/AppError';

export class CreateCircleUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: CreateCircleInputDTO): Promise<CreateCircleOutputDTO> {
    const userId = UserId.create(dto.userId);

    // Check max circles per user (10)
    const userCircleCount = await this.circleRepo.countByMemberId(userId);
    if (userCircleCount >= Circle.getMaxCirclesPerUser()) {
      throw AppError.badRequest(`Maximum ${Circle.getMaxCirclesPerUser()} circles per user reached`);
    }

    // Create circle (adds creator as admin automatically)
    const circleId = CircleId.create();
    const circle = Circle.create({
      id: circleId,
      name: dto.name,
      createdBy: userId,
    });

    // Persist
    await this.circleRepo.save(circle);

    // Publish domain events
    for (const event of circle.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    circle.clearDomainEvents();

    return {
      circleId: circleId.getValue(),
      name: circle.getName(),
      role: 'CIRCLE_ADMIN',
    };
  }
}
