import { describe, it, expect } from 'vitest';
import { DailyLimit } from '../../../../src/domain/value-objects/DailyLimit';

describe('DailyLimit Value Object', () => {
  describe('create', () => {
    it('should create a valid daily limit', () => {
      const limit = DailyLimit.create(100);
      expect(limit.getValue()).toBe(100);
    });

    it('should accept minimum value (1)', () => {
      const limit = DailyLimit.create(1);
      expect(limit.getValue()).toBe(1);
    });

    it('should accept maximum value (500)', () => {
      const limit = DailyLimit.create(500);
      expect(limit.getValue()).toBe(500);
    });

    it('should reject 0', () => {
      expect(() => DailyLimit.create(0)).toThrow();
    });

    it('should reject negative numbers', () => {
      expect(() => DailyLimit.create(-1)).toThrow();
    });

    it('should reject values > 500', () => {
      expect(() => DailyLimit.create(501)).toThrow();
    });

    it('should reject non-integers', () => {
      expect(() => DailyLimit.create(1.5)).toThrow();
      expect(() => DailyLimit.create(99.9)).toThrow();
    });

    it('should reject NaN', () => {
      expect(() => DailyLimit.create(NaN)).toThrow();
    });

    it('should reject non-number types', () => {
      expect(() => DailyLimit.create('100' as any)).toThrow();
    });
  });

  describe('isExceeded', () => {
    it('should return false when count is below limit', () => {
      const limit = DailyLimit.create(100);
      expect(limit.isExceeded(50)).toBe(false);
    });

    it('should return true when count equals limit', () => {
      const limit = DailyLimit.create(100);
      expect(limit.isExceeded(100)).toBe(true);
    });

    it('should return true when count exceeds limit', () => {
      const limit = DailyLimit.create(100);
      expect(limit.isExceeded(101)).toBe(true);
    });

    it('should return false when count is 0', () => {
      const limit = DailyLimit.create(1);
      expect(limit.isExceeded(0)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const l1 = DailyLimit.create(100);
      const l2 = DailyLimit.create(100);
      expect(l1.equals(l2)).toBe(true);
    });

    it('should return false for different values', () => {
      const l1 = DailyLimit.create(100);
      const l2 = DailyLimit.create(200);
      expect(l1.equals(l2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const limit = DailyLimit.create(100);
      expect(Object.isFrozen(limit)).toBe(true);
    });
  });
});
