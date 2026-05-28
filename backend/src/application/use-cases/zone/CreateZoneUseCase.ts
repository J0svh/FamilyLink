import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IZoneRepository } from '../../../domain/ports/IZoneRepository';
import { Zone } from '../../../domain/entities/Zone';
import { ZoneId } from '../../../domain/value-objects/ZoneId';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { ColorHex } from '../../../domain/value-objects/ColorHex';
import { ZonePolygon } from '../../../domain/value-objects/ZonePolygon';
import { Circle } from '../../../domain/aggregates/circle/Circle';
import { CreateZoneInputDTO, CreateZoneOutputDTO } from '../../dtos/zone/CreateZoneDTO';
import { AppError } from '../../../shared/AppError';

export class CreateZoneUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly zoneRepo: IZoneRepository,
  ) {}

  async execute(dto: CreateZoneInputDTO): Promise<CreateZoneOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    // Verify circle exists and user is admin
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }
    if (!circle.isMember(userId)) {
      throw AppError.forbidden('Only circle members can create zones');
    }

    // Check max zones per circle (20)
    const zoneCount = await this.zoneRepo.countByCircleId(circleId);
    if (zoneCount >= Circle.getMaxZonesPerCircle()) {
      throw AppError.badRequest(`Maximum ${Circle.getMaxZonesPerCircle()} zones per circle reached`);
    }

    // Create value objects (validates format, area, self-intersection)
    const colorHex = ColorHex.create(dto.colorHex);
    const polygon = ZonePolygon.create(dto.vertices);

    // Create zone entity
    const zoneId = ZoneId.create();
    const zone = Zone.create({
      id: zoneId,
      circleId,
      name: dto.name,
      nameEn: dto.nameEn,
      colorHex,
      polygon,
    });

    // Persist
    await this.zoneRepo.save(zone);

    return {
      zoneId: zoneId.getValue(),
      name: zone.getName(),
      areaSqm: zone.getAreaSqm(),
    };
  }
}
