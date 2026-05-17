import { DailyLimit } from '../value-objects/DailyLimit';

export class DailyLimitService {
  private static readonly DEFAULT_DAILY_LIMIT = 100;

  /**
   * Checks if the daily limit has been reached.
   */
  isLimitReached(currentCount: number, limit: DailyLimit): boolean {
    return currentCount >= limit.getValue();
  }

  /**
   * Returns the number of remaining shares for the day.
   */
  getRemainingShares(currentCount: number, limit: DailyLimit): number {
    const remaining = limit.getValue() - currentCount;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Returns the default daily limit.
   */
  getDefaultLimit(): DailyLimit {
    return DailyLimit.create(DailyLimitService.DEFAULT_DAILY_LIMIT);
  }
}
