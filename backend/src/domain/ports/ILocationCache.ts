import { UserId } from '../value-objects/UserId';
import { Coordinates } from '../value-objects/Coordinates';

export interface ILocationCache {
  setActiveLocation(userId: UserId, coords: Coordinates, ttlSeconds: number): Promise<void>;
  getActiveLocation(userId: UserId): Promise<Coordinates | null>;
  removeActiveLocation(userId: UserId): Promise<void>;
}
