import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { UserId } from '../../../domain/value-objects/UserId';

export interface CircleSummaryDTO {
  circleId: string;
  name: string;
  role: string;
  memberCount: number;
}

export class GetUserCirclesUseCase {
  constructor(private readonly circleRepo: ICircleRepository) {}

  async execute(userId: string): Promise<CircleSummaryDTO[]> {
    const userIdVO = UserId.create(userId);
    const circles = await this.circleRepo.findByMemberId(userIdVO);

    return circles.map(c => ({
      circleId: c.getId().getValue(),
      name: c.getName(),
      role: c.isAdmin(userIdVO) ? 'CIRCLE_ADMIN' : 'CIRCLE_MEMBER',
      memberCount: c.getMemberCount(),
    }));
  }
}
