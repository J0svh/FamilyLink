import { prisma } from './PrismaClient';
import { ILocationRepository } from '../../domain/ports/ILocationRepository';
import { LocationUpdate } from '../../domain/entities/LocationUpdate';
import { UserId } from '../../domain/value-objects/UserId';
import { CircleId } from '../../domain/value-objects/CircleId';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-dev-only!';
const ALGORITHM = 'aes-256-gcm';

export class PostgresLocationRepository implements ILocationRepository {
  async save(location: LocationUpdate): Promise<void> {
    const coords = location.getCoordinates();

    await prisma.locationUpdate.create({
      data: {
        id: location.getId(),
        userId: location.getUserId().getValue(),
        circleId: location.getCircleId().getValue(),
        latitude: coords.getLatitude(),
        longitude: coords.getLongitude(),
        capturedAt: location.getCapturedAt(),
      },
    });
  }

  async findLatestByUserId(userId: UserId): Promise<LocationUpdate | null> {
    const record = await prisma.locationUpdate.findFirst({
      where: { userId: userId.getValue() },
      orderBy: { capturedAt: 'desc' },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCircleId(circleId: CircleId, since: Date): Promise<LocationUpdate[]> {
    const records = await prisma.locationUpdate.findMany({
      where: {
        circleId: circleId.getValue(),
        capturedAt: { gte: since },
      },
      orderBy: { capturedAt: 'desc' },
    });

    return records.map(r => this.toDomain(r));
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await prisma.locationUpdate.deleteMany({
      where: { capturedAt: { lt: date } },
    });
  }

  async countTodayByUserId(userId: UserId): Promise<number> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return prisma.locationUpdate.count({
      where: {
        userId: userId.getValue(),
        capturedAt: { gte: today },
      },
    });
  }

  private toDomain(record: any): LocationUpdate {
    return LocationUpdate.create({
      id: record.id,
      userId: UserId.create(record.userId),
      circleId: CircleId.create(record.circleId),
      coordinates: Coordinates.create(record.latitude, record.longitude),
      capturedAt: record.capturedAt,
      createdAt: record.createdAt,
    });
  }
}
