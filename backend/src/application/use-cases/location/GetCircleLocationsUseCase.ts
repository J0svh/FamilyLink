import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { ILocationRepository } from '../../../domain/ports/ILocationRepository';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { GetCircleLocationsInputDTO, GetCircleLocationsOutputDTO, MemberLocationDTO } from '../../dtos/location/GetCircleLocationsDTO';
import { AppError } from '../../../shared/AppError';

export class GetCircleLocationsUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly locationRepo: ILocationRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: GetCircleLocationsInputDTO): Promise<GetCircleLocationsOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const requestingUserId = UserId.create(dto.requestingUserId);

    // Verify circle exists
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    // Verify requester is a member
    if (!circle.isMember(requestingUserId)) {
      throw AppError.forbidden('User is not a member of this circle');
    }

    // Get all members' latest locations
    const members: MemberLocationDTO[] = [];

    for (const member of circle.getMembers()) {
      const memberId = member.getUserId();

      // Get user info
      const user = await this.userRepo.findById(memberId);
      if (!user) continue;

      // Check if user has privacy mode active
      const isPrivacyActive = user.isPrivacyModeActive();

      // If privacy mode is active, don't show location
      if (isPrivacyActive) {
        members.push({
          userId: memberId.getValue(),
          username: user.getUsername(),
          latitude: 0,
          longitude: 0,
          capturedAt: new Date(0),
          isPrivacyModeActive: true,
        });
        continue;
      }

      // Get latest location
      const latestLocation = await this.locationRepo.findLatestByUserId(memberId);

      if (latestLocation) {
        members.push({
          userId: memberId.getValue(),
          username: user.getUsername(),
          latitude: latestLocation.getCoordinates().getLatitude(),
          longitude: latestLocation.getCoordinates().getLongitude(),
          capturedAt: latestLocation.getCapturedAt(),
          isPrivacyModeActive: false,
        });
      } else {
        members.push({
          userId: memberId.getValue(),
          username: user.getUsername(),
          latitude: 0,
          longitude: 0,
          capturedAt: new Date(0),
          isPrivacyModeActive: false,
        });
      }
    }

    return {
      circleId: circleId.getValue(),
      members,
    };
  }
}
