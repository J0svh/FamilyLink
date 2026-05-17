import { prisma } from './PrismaClient';
import { IZoneRepository } from '../../domain/ports/IZoneRepository';
import { Zone } from '../../domain/entities/Zone';
import { ZoneId } from '../../domain/value-objects/ZoneId';
import { CircleId } from '../../domain/value-objects/CircleId';
import { ColorHex } from '../../domain/value-objects/ColorHex';
import { ZonePolygon, Vertex } from '../../domain/value-objects/ZonePolygon';

export class PostgresZoneRepository implements IZoneRepository {
  async findById(id: ZoneId): Promise<Zone | null> {
    const record = await prisma.zone.findUnique({
      where: { id: id.getValue() },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCircleId(circleId: CircleId): Promise<Zone[]> {
    const records = await prisma.zone.findMany({
      where: { circleId: circleId.getValue() },
    });

    return records.map(r => this.toDomain(r));
  }

  async save(zone: Zone): Promise<void> {
    const data = {
      id: zone.getId().getValue(),
      circleId: zone.getCircleId().getValue(),
      name: zone.getName(),
      nameEn: zone.getNameEn() ?? null,
      colorHex: zone.getColorHex().getValue(),
      polygon: zone.getPolygon().getVertices() as any,
      areaSqm: zone.getAreaSqm(),
      active: zone.isActive(),
    };

    await prisma.zone.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async delete(id: ZoneId): Promise<void> {
    await prisma.zone.delete({
      where: { id: id.getValue() },
    });
  }

  async countByCircleId(circleId: CircleId): Promise<number> {
    return prisma.zone.count({
      where: { circleId: circleId.getValue() },
    });
  }

  private toDomain(record: any): Zone {
    const vertices = record.polygon as Vertex[];
    return Zone.create({
      id: ZoneId.create(record.id),
      circleId: CircleId.create(record.circleId),
      name: record.name,
      nameEn: record.nameEn ?? undefined,
      colorHex: ColorHex.create(record.colorHex),
      polygon: ZonePolygon.create(vertices),
      active: record.active,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
