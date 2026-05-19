import { ILocationCache } from '../../../src/domain/ports/ILocationCache';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Coordinates } from '../../../src/domain/value-objects/Coordinates';

export class FakeLocationCache implements ILocationCache {
  private cache: Map<string, { coords: Coordinates; ttl: number }> = new Map();

  async setActiveLocation(userId: UserId, coords: Coordinates, ttlSeconds: number): Promise<void> {
    this.cache.set(userId.getValue(), { coords, ttl: ttlSeconds });
  }

  async getActiveLocation(userId: UserId): Promise<Coordinates | null> {
    const entry = this.cache.get(userId.getValue());
    return entry?.coords ?? null;
  }

  async removeActiveLocation(userId: UserId): Promise<void> {
    this.cache.delete(userId.getValue());
  }

  clear(): void {
    this.cache.clear();
  }
}
