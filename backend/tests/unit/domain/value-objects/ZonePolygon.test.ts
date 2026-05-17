import { describe, it, expect } from 'vitest';
import { ZonePolygon } from '../../../../src/domain/value-objects/ZonePolygon';

describe('ZonePolygon Value Object', () => {
  // A large triangle in Madrid area (~several km²)
  const validTriangle = [
    { lat: 40.4168, lng: -3.7038 },
    { lat: 40.4268, lng: -3.6938 },
    { lat: 40.4068, lng: -3.6938 },
  ];

  // A square roughly 200m x 200m (well above 100m²)
  const validSquare = [
    { lat: 40.4168, lng: -3.7038 },
    { lat: 40.4186, lng: -3.7038 },
    { lat: 40.4186, lng: -3.7015 },
    { lat: 40.4168, lng: -3.7015 },
  ];

  describe('create', () => {
    it('should create a valid polygon with 3 vertices', () => {
      const polygon = ZonePolygon.create(validTriangle);
      expect(polygon.getVertexCount()).toBe(3);
    });

    it('should create a valid polygon with 4 vertices', () => {
      const polygon = ZonePolygon.create(validSquare);
      expect(polygon.getVertexCount()).toBe(4);
    });

    it('should calculate area in square meters', () => {
      const polygon = ZonePolygon.create(validTriangle);
      expect(polygon.getAreaSqm()).toBeGreaterThan(100);
    });

    it('should reject fewer than 3 vertices', () => {
      expect(() => ZonePolygon.create([
        { lat: 40.4168, lng: -3.7038 },
        { lat: 40.4268, lng: -3.6938 },
      ])).toThrow('at least 3 vertices');
    });

    it('should reject more than 50 vertices', () => {
      const tooMany = Array.from({ length: 51 }, (_, i) => ({
        lat: 40 + (i * 0.01),
        lng: -3 + (i * 0.01),
      }));
      expect(() => ZonePolygon.create(tooMany)).toThrow('at most 50 vertices');
    });

    it('should reject non-array input', () => {
      expect(() => ZonePolygon.create('not an array' as any)).toThrow();
    });

    it('should reject vertices with invalid lat', () => {
      expect(() => ZonePolygon.create([
        { lat: 91, lng: 0 },
        { lat: 40, lng: 1 },
        { lat: 40, lng: -1 },
      ])).toThrow();
    });

    it('should reject vertices with invalid lng', () => {
      expect(() => ZonePolygon.create([
        { lat: 40, lng: 181 },
        { lat: 40, lng: 1 },
        { lat: 41, lng: 1 },
      ])).toThrow();
    });

    it('should reject polygon with area < 100m²', () => {
      // Tiny triangle (< 1m²)
      const tiny = [
        { lat: 40.416800, lng: -3.703800 },
        { lat: 40.416801, lng: -3.703800 },
        { lat: 40.416800, lng: -3.703801 },
      ];
      expect(() => ZonePolygon.create(tiny)).toThrow('at least 100');
    });

    it('should reject self-intersecting polygon (bowtie)', () => {
      // Bowtie shape: edges cross
      const bowtie = [
        { lat: 40.40, lng: -3.70 },
        { lat: 40.42, lng: -3.68 },
        { lat: 40.40, lng: -3.68 },
        { lat: 40.42, lng: -3.70 },
      ];
      expect(() => ZonePolygon.create(bowtie)).toThrow('self-intersect');
    });
  });

  describe('getters', () => {
    it('should return vertices as readonly array', () => {
      const polygon = ZonePolygon.create(validTriangle);
      const vertices = polygon.getVertices();
      expect(vertices.length).toBe(3);
      expect(vertices[0]).toEqual(validTriangle[0]);
    });

    it('should return area in square meters', () => {
      const polygon = ZonePolygon.create(validSquare);
      expect(polygon.getAreaSqm()).toBeGreaterThan(100);
    });
  });

  describe('equals', () => {
    it('should return true for same vertices', () => {
      const p1 = ZonePolygon.create(validTriangle);
      const p2 = ZonePolygon.create([...validTriangle]);
      expect(p1.equals(p2)).toBe(true);
    });

    it('should return false for different vertices', () => {
      const p1 = ZonePolygon.create(validTriangle);
      const p2 = ZonePolygon.create(validSquare);
      expect(p1.equals(p2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should include vertex count and area', () => {
      const polygon = ZonePolygon.create(validTriangle);
      const str = polygon.toString();
      expect(str).toContain('3 vertices');
      expect(str).toContain('m²');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const polygon = ZonePolygon.create(validTriangle);
      expect(Object.isFrozen(polygon)).toBe(true);
    });
  });
});
