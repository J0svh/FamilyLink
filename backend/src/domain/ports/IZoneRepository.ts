import { Zone } from '../entities/Zone';
import { ZoneId } from '../value-objects/ZoneId';
import { CircleId } from '../value-objects/CircleId';

export interface IZoneRepository {
  findById(id: ZoneId): Promise<Zone | null>;
  findByCircleId(circleId: CircleId): Promise<Zone[]>;
  save(zone: Zone): Promise<void>;
  delete(id: ZoneId): Promise<void>;
  countByCircleId(circleId: CircleId): Promise<number>;
}
