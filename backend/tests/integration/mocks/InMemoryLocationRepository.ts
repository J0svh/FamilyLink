import { ILocationRepository } from '../../../src/domain/ports/ILocationRepository';
import { LocationUpdate } from '../../../src/domain/entities/LocationUpdate';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { CircleId } from '../../../src/domain/value-objects/CircleId';

export class InMemoryLocationRepository implements ILocationRepository {
  private locations: LocationUpdate[] = [];

  async save(location: LocationUpdate): Promise<void> {
    this.locations.push(location);
  }

  async findLatestByUserId(userId: UserId): Promise<LocationUpdate | null> {
    const userLocations = this.locations
      .filter(l => l.getUserId().equals(userId))
      .sort((a, b) => b.getCapturedAt().getTime() - a.getCapturedAt().getTime());
    return userLocations[0] ?? null;
  }

  async findByCircleId(circleId: CircleId, since: Date): Promise<LocationUpdate[]> {
    return this.locations.filter(
      l => l.getCircleId().equals(circleId) && l.getCapturedAt() >= since,
    );
  }

  async deleteOlderThan(date: Date): Promise<void> {
    this.locations = this.locations.filter(l => l.getCapturedAt() >= date);
  }

  async countTodayByUserId(userId: UserId): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.locations.filter(
      l => l.getUserId().equals(userId) && l.getCapturedAt() >= today,
    ).length;
  }

  clear(): void {
    this.locations = [];
  }
}
