import { Circle } from '../aggregates/circle/Circle';
import { CircleId } from '../value-objects/CircleId';
import { UserId } from '../value-objects/UserId';

export interface ICircleRepository {
  findById(id: CircleId): Promise<Circle | null>;
  findByMemberId(userId: UserId): Promise<Circle[]>;
  save(circle: Circle): Promise<void>;
  delete(id: CircleId): Promise<void>;
  countByMemberId(userId: UserId): Promise<number>;
}
