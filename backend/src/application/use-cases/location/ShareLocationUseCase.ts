import { v4 as uuidv4 } from 'uuid';

import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { ILocationRepository } from '../../../domain/ports/ILocationRepository';
import { IZoneRepository } from '../../../domain/ports/IZoneRepository';
import { ILocationCache } from '../../../domain/ports/ILocationCache';
import { IEventPublisher } from '../../../domain/ports/IEventPublisher';
import { ZoneEvaluationService } from '../../../domain/services/ZoneEvaluationService';
import { DailyLimitService } from '../../../domain/services/DailyLimitService';
import { LocationUpdate } from '../../../domain/entities/LocationUpdate';
import { Coordinates } from '../../../domain/value-objects/Coordinates';
import { UserId } from '../../../domain/value-objects/UserId';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { LocationShared } from '../../../domain/events/LocationShared';
import { ZoneEntered } from '../../../domain/events/ZoneEntered';
import { ZoneExited } from '../../../domain/events/ZoneExited';

import { ShareLocationInputDTO, ShareLocationOutputDTO } from '../../dtos/location/ShareLocationDTO';
import { AppError } from '../../../shared/AppError';

export class ShareLocationUseCase {
  private readonly zoneEvaluationService: ZoneEvaluationService;
  private readonly dailyLimitService: DailyLimitService;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly circleRepo: ICircleRepository,
    private readonly locationRepo: ILocationRepository,
    private readonly zoneRepo: IZoneRepository,
    private readonly locationCache: ILocationCache,
    private readonly eventPublisher: IEventPublisher,
  ) {
    this.zoneEvaluationService = new ZoneEvaluationService();
    this.dailyLimitService = new DailyLimitService();
  }

  async execute(dto: ShareLocationInputDTO): Promise<ShareLocationOutputDTO> {
    const userId = UserId.create(dto.userId);
    const circleId = CircleId.create(dto.circleId);
    const coordinates = Coordinates.create(dto.latitude, dto.longitude);

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }
    if (!circle.isMember(userId)) {
      throw AppError.forbidden('User is not a member of this circle');
    }

    if (user.isPrivacyModeActive()) {
      throw AppError.forbidden('Cannot share location while privacy mode is active');
    }

    const todayCount = await this.locationRepo.countTodayByUserId(userId);
    const defaultLimit = this.dailyLimitService.getDefaultLimit();
    if (this.dailyLimitService.isLimitReached(todayCount, defaultLimit)) {
      throw AppError.tooManyRequests('Daily location sharing limit reached');
    }

    const previousLocation = await this.locationRepo.findLatestByUserId(userId);
    const previousCoordinates = previousLocation?.getCoordinates() ?? null;

    const capturedAt = new Date();
    const locationUpdate = LocationUpdate.create({
      id: uuidv4(),
      userId,
      circleId,
      coordinates,
      capturedAt,
    });

    await this.locationRepo.save(locationUpdate);
    await this.locationCache.setActiveLocation(userId, coordinates, 300);
    await this.eventPublisher.publish(new LocationShared(userId, circleId, coordinates, capturedAt));

    const zones = await this.zoneRepo.findByCircleId(circleId);
    const transitions = this.zoneEvaluationService.evaluateTransitions(
      previousCoordinates,
      coordinates,
      zones,
    );

    const zonesEntered: string[] = [];
    const zonesExited: string[] = [];

    for (const transition of transitions) {
      if (transition.type === 'entered') {
        zonesEntered.push(transition.zone.getName());
        await this.eventPublisher.publish(
          new ZoneEntered(userId, circleId, transition.zone.getId(), capturedAt),
        );
      } else {
        zonesExited.push(transition.zone.getName());
        await this.eventPublisher.publish(
          new ZoneExited(userId, circleId, transition.zone.getId(), capturedAt),
        );
      }
    }

    return {
      locationId: locationUpdate.getId(),
      capturedAt,
      zonesEntered,
      zonesExited,
    };
  }
}