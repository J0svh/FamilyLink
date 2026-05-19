import { DailyLimit } from '../value-objects/DailyLimit';

export class DailyLimitService {
  /**
   * Checks if a user has reached their daily location sharing limit.
   * @param currentCount - Number of location updates shared today
   * @param limit - The configured daily limit for the user in this circle
   * @returns true if the limit has been reached or exceeded
   */
  isLimitReached(currentCount: number, limit: DailyLimit): boolean {
    return limit.isExceeded(currentCount);
  }

  /**
   * Calculates remaining shares for today.
   * @param currentCount - Number of location updates shared today
   * @param limit - The configured daily limit
   * @returns Number of remaining shares (minimum 0)
   */
  getRemainingShares(currentCount: number, limit: DailyLimit): number {
    const remaining = limit.getValue() - currentCount;
    return Math.max(0, remaining);
  }

  /**
   * Gets the default daily limit value.
   * Used when no custom limit is configured for a user in a circle.
   */
  getDefaultLimit(): DailyLimit {
    return DailyLimit.create(100);
  }
}
