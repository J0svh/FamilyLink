import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { IZoneRepository } from '../../../domain/ports/IZoneRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { GetZonesByCircleInputDTO, GetZonesByCircleOutputDTO, ZoneDTO } from '../../dtos/zone/GetZonesByCircleDTO';
import { AppError } from '../../../shared/AppError';

export class GetZonesByCircleUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
    private readonly zoneRepo: IZoneRepository,
  ) {}

  async execute(dto: GetZonesByCircleInputDTO): Promise<GetZonesByCircleOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    // Verify circle exists and user is a member
    const circle = await this.circleRepo.findById(circleId);
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }
    if (!circle.isMember(userId)) {
      throw AppError.forbidden('User is not a member of this circle');
    }

    // Get active zones
    const zones = await this.zoneRepo.findByCircleId(circleId);

    const zoneDTOs: ZoneDTO[] = zones
      .filter(z => z.isActive())
      .map(z => ({
        zoneId: z.getId().getValue(),
        name: z.getName(),
        nameEn: z.getNameEn(),
        colorHex: z.getColorHex().getValue(),
        vertices: z.getPolygon().getVertices().map(v => ({ lat: v.lat, lng: v.lng })),
        areaSqm: z.getAreaSqm(),
        active: z.isActive(),
      }));

    return {
      circleId: circleId.getValue(),
      zones: zoneDTOs,
    };
  }
}
