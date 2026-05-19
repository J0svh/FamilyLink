import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IZoneRepository } from '../../../domain/ports/IZoneRepository';
import { ZoneId } from '../../../domain/value-objects/ZoneId';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { ColorHex } from '../../../domain/value-objects/ColorHex';
import { ZonePolygon } from '../../../domain/value-objects/ZonePolygon';
import { UpdateZoneInputDTO, UpdateZoneOutputDTO } from '../../dtos/zone/UpdateZoneDTO';
import { AppError } from '../../../shared/AppError';

export class UpdateZoneUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly zoneRepo: IZoneRepository,
  ) {}

  async execute(dto: UpdateZoneInputDTO): Promise<UpdateZoneOutputDTO> {
    const zoneId = ZoneId.create(dto.zoneId);
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    // Verify circle exists and user is admin
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }
    if (!circle.isAdmin(userId)) {
      throw AppError.forbidden('Only circle admins can update zones');
    }

    // Find zone
    const zone = await this.zoneRepo.findById(zoneId);
    if (!zone) {
      throw AppError.notFound('Zone not found');
    }

    // Verify zone belongs to circle
    if (!zone.getCircleId().equals(circleId)) {
      throw AppError.forbidden('Zone does not belong to this circle');
    }

    // Apply updates
    if (dto.name !== undefined) {
      zone.updateName(dto.name, dto.nameEn);
    }

    if (dto.colorHex !== undefined) {
      zone.updateColor(ColorHex.create(dto.colorHex));
    }

    if (dto.vertices !== undefined) {
      zone.updatePolygon(ZonePolygon.create(dto.vertices));
    }

    // Persist
    await this.zoneRepo.save(zone);

    return {
      zoneId: zoneId.getValue(),
      name: zone.getName(),
      areaSqm: zone.getAreaSqm(),
    };
  }
}
