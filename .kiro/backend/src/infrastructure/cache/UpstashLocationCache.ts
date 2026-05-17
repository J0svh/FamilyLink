import { ILocationCache } from '../../domain/ports/ILocationCache';
import { UserId } from '../../domain/value-objects/UserId';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { logger } from '../../shared/logger';

interface RedisClient {
  set(key: string, value: string, options?: { ex?: number }): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
}

export class UpstashLocationCache implements ILocationCache {
  private redis: RedisClient | null;

  constructor(redis: RedisClient | null) {
    this.redis = redis;
  }

  async setActiveLocation(userId: UserId, coords: Coordinates, ttlSeconds: number): Promise<void> {
    if (!this.redis) {
      logger.warn('Redis not available, skipping cache set');
      return;
    }

    try {
      const key = this.buildKey(userId);
      const value = JSON.stringify({
        lat: coords.getLatitude(),
        lng: coords.getLongitude(),
        updatedAt: new Date().toISOString(),
      });

      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      logger.error({ error }, 'Failed to set location in cache');
      // Graceful fallback — don't throw
    }
  }

  async getActiveLocation(userId: UserId): Promise<Coordinates | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const key = this.buildKey(userId);
      const value = await this.redis.get(key);

      if (!value) return null;

      const parsed = JSON.parse(value);
      return Coordinates.create(parsed.lat, parsed.lng);
    } catch (error) {
      logger.error({ error }, 'Failed to get location from cache');
      return null;
    }
  }

  async removeActiveLocation(userId: UserId): Promise<void> {
    if (!this.redis) return;

    try {
      const key = this.buildKey(userId);
      await this.redis.del(key);
    } catch (error) {
      logger.error({ error }, 'Failed to remove location from cache');
    }
  }

  private buildKey(userId: UserId): string {
    return `location:active:${userId.getValue()}`;
  }
}
