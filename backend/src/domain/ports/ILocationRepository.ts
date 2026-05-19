import { LocationUpdate } from '../entities/LocationUpdate';
import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';

export interface ILocationRepository {
  save(location: LocationUpdate): Promise<void>;
  findLatestByUserId(userId: UserId): Promise<LocationUpdate | null>;
  findByCircleId(circleId: CircleId, since: Date): Promise<LocationUpdate[]>;
  deleteOlderThan(date: Date): Promise<void>;
  countTodayByUserId(userId: UserId): Promise<number>;
}
