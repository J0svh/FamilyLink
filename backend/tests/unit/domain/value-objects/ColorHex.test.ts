import { describe, it, expect } from 'vitest';
import { ColorHex } from '../../../../src/domain/value-objects/ColorHex';

describe('ColorHex Value Object', () => {
  describe('create', () => {
    it('should create a valid color hex', () => {
      const color = ColorHex.create('#FF5733');
      expect(color.getValue()).toBe('#FF5733');
    });

    it('should normalize to uppercase', () => {
      const color = ColorHex.create('#ff5733');
      expect(color.getValue()).toBe('#FF5733');
    });

    it('should trim whitespace', () => {
      const color = ColorHex.create('  #FF5733  ');
      expect(color.getValue()).toBe('#FF5733');
    });

    it('should accept valid hex colors', () => {
      const validColors = ['#000000', '#FFFFFF', '#123ABC', '#aabbcc'];
      validColors.forEach(c => {
        expect(() => ColorHex.create(c)).not.toThrow();
      });
    });

    it('should reject empty string', () => {
      expect(() => ColorHex.create('')).toThrow();
    });

    it('should reject without hash', () => {
      expect(() => ColorHex.create('FF5733')).toThrow();
    });

    it('should reject short hex (3 chars)', () => {
      expect(() => ColorHex.create('#FFF')).toThrow();
    });

    it('should reject hex with alpha (8 chars)', () => {
      expect(() => ColorHex.create('#FF5733AA')).toThrow();
    });

    it('should reject invalid hex characters', () => {
      expect(() => ColorHex.create('#GGHHII')).toThrow();
    });

    it('should reject null/undefined', () => {
      expect(() => ColorHex.create(null as any)).toThrow();
      expect(() => ColorHex.create(undefined as any)).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same color', () => {
      const c1 = ColorHex.create('#FF5733');
      const c2 = ColorHex.create('#ff5733');
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different colors', () => {
      const c1 = ColorHex.create('#FF5733');
      const c2 = ColorHex.create('#000000');
      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the hex string', () => {
      const color = ColorHex.create('#FF5733');
      expect(color.toString()).toBe('#FF5733');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const color = ColorHex.create('#FF5733');
      expect(Object.isFrozen(color)).toBe(true);
    });
  });
});
