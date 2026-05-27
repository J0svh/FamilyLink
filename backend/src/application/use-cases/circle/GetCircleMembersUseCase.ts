import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { OnlineTracker } from '../../../infrastructure/realtime/OnlineTracker';
import { AppError } from '../../../shared/AppError';

export interface MemberDTO {
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
}

export interface GetCircleMembersInputDTO {
  circleId: string;
  requestingUserId: string;
}

export class GetCircleMembersUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly userRepo: IUserRepository,
    private readonly onlineTracker: OnlineTracker,
  ) {}

  async execute(dto: GetCircleMembersInputDTO): Promise<MemberDTO[]> {
    const circleId = CircleId.create(dto.circleId);
    const requestingUserId = UserId.create(dto.requestingUserId);

    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    if (!circle.isMember(requestingUserId)) {
      throw AppError.forbidden('Not a circle member');
    }

    const members = circle.getMembers();
    const results: MemberDTO[] = [];

    for (const member of members) {
      const user = await this.userRepo.findById(member.getUserId());
      results.push({
        userId: member.getUserId().getValue(),
        username: user?.getUsername() ?? 'Desconocido',
        role: member.getRole(),
        isOnline: this.onlineTracker.isOnline(member.getUserId().getValue()),
      });
    }

    return results;
  }
}
