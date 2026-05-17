import { describe, it, expect } from 'vitest';
import { DailyLimitService } from '../../../../src/domain/services/DailyLimitService';
import { DailyLimit } from '../../../../src/domain/value-objects/DailyLimit';

describe('DailyLimitService', () => {
  const service = new DailyLimitService();

  describe('isLimitReached', () => {
    it('should return false when count is below limit', () => {
      const limit = DailyLimit.create(100);
      expect(service.isLimitReached(50, limit)).toBe(false);
    });

    it('should return true when count equals limit', () => {
      const limit = DailyLimit.create(100);
      expect(service.isLimitReached(100, limit)).toBe(true);
    });

    it('should return true when count exceeds limit', () => {
      const limit = DailyLimit.create(100);
      expect(service.isLimitReached(150, limit)).toBe(true);
    });

    it('should work with minimum limit (1)', () => {
      const limit = DailyLimit.create(1);
      expect(service.isLimitReached(0, limit)).toBe(false);
      expect(service.isLimitReached(1, limit)).toBe(true);
    });

    it('should work with maximum limit (500)', () => {
      const limit = DailyLimit.create(500);
      expect(service.isLimitReached(499, limit)).toBe(false);
      expect(service.isLimitReached(500, limit)).toBe(true);
    });
  });

  describe('getRemainingShares', () => {
    it('should return remaining shares', () => {
      const limit = DailyLimit.create(100);
      expect(service.getRemainingShares(30, limit)).toBe(70);
    });

    it('should return 0 when limit reached', () => {
      const limit = DailyLimit.create(100);
      expect(service.getRemainingShares(100, limit)).toBe(0);
    });

    it('should return 0 when limit exceeded', () => {
      const limit = DailyLimit.create(100);
      expect(service.getRemainingShares(150, limit)).toBe(0);
    });

    it('should return full limit when count is 0', () => {
      const limit = DailyLimit.create(100);
      expect(service.getRemainingShares(0, limit)).toBe(100);
    });
  });

  describe('getDefaultLimit', () => {
    it('should return a limit of 100', () => {
      const defaultLimit = service.getDefaultLimit();
      expect(defaultLimit.getValue()).toBe(100);
    });
  });
});
