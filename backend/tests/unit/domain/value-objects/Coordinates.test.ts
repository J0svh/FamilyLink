import { describe, it, expect } from 'vitest';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';

describe('Coordinates Value Object', () => {
  describe('create', () => {
    it('should create valid coordinates', () => {
      const coords = Coordinates.create(40.4168, -3.7038);
      expect(coords.getLatitude()).toBe(40.4168);
      expect(coords.getLongitude()).toBe(-3.7038);
    });

    it('should accept boundary values', () => {
      expect(() => Coordinates.create(90, 180)).not.toThrow();
      expect(() => Coordinates.create(-90, -180)).not.toThrow();
      expect(() => Coordinates.create(0, 0)).not.toThrow();
    });

    it('should reject latitude > 90', () => {
      expect(() => Coordinates.create(90.1, 0)).toThrow();
    });

    it('should reject latitude < -90', () => {
      expect(() => Coordinates.create(-90.1, 0)).toThrow();
    });

    it('should reject longitude > 180', () => {
      expect(() => Coordinates.create(0, 180.1)).toThrow();
    });

    it('should reject longitude < -180', () => {
      expect(() => Coordinates.create(0, -180.1)).toThrow();
    });

    it('should reject NaN latitude', () => {
      expect(() => Coordinates.create(NaN, 0)).toThrow();
    });

    it('should reject NaN longitude', () => {
      expect(() => Coordinates.create(0, NaN)).toThrow();
    });

    it('should reject non-number types', () => {
      expect(() => Coordinates.create('40' as any, 0)).toThrow();
      expect(() => Coordinates.create(0, '3' as any)).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same coordinates', () => {
      const c1 = Coordinates.create(40.4168, -3.7038);
      const c2 = Coordinates.create(40.4168, -3.7038);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different coordinates', () => {
      const c1 = Coordinates.create(40.4168, -3.7038);
      const c2 = Coordinates.create(41.0, -3.7038);
      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return lat/lng object', () => {
      const coords = Coordinates.create(40.4168, -3.7038);
      expect(coords.toJSON()).toEqual({ lat: 40.4168, lng: -3.7038 });
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const coords = Coordinates.create(40.4168, -3.7038);
      expect(coords.toString()).toBe('(40.4168, -3.7038)');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const coords = Coordinates.create(40.4168, -3.7038);
      expect(Object.isFrozen(coords)).toBe(true);
    });
  });
});
