import { describe, it, expect } from 'vitest';
import { Zone } from '../../../../src/domain/entities/Zone';
import { ZoneId } from '../../../../src/domain/value-objects/ZoneId';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';
import { ColorHex } from '../../../../src/domain/value-objects/ColorHex';
import { ZonePolygon } from '../../../../src/domain/value-objects/ZonePolygon';

describe('Zone Entity', () => {
  const validPolygonVertices = [
    { lat: 40.4168, lng: -3.7038 },
    { lat: 40.4268, lng: -3.6938 },
    { lat: 40.4068, lng: -3.6938 },
  ];

  const createValidZone = () => Zone.create({
    id: ZoneId.create(),
    circleId: CircleId.create(),
    name: 'Home Zone',
    nameEn: 'Home Zone',
    colorHex: ColorHex.create('#FF5733'),
    polygon: ZonePolygon.create(validPolygonVertices),
  });

  describe('create', () => {
    it('should create a valid zone', () => {
      const zone = createValidZone();
      expect(zone.getName()).toBe('Home Zone');
      expect(zone.getNameEn()).toBe('Home Zone');
      expect(zone.isActive()).toBe(true);
    });

    it('should default active to true', () => {
      const zone = createValidZone();
      expect(zone.isActive()).toBe(true);
    });

    it('should reject empty name', () => {
      expect(() => Zone.create({
        id: ZoneId.create(),
        circleId: CircleId.create(),
        name: '',
        colorHex: ColorHex.create('#FF5733'),
        polygon: ZonePolygon.create(validPolygonVertices),
      })).toThrow('name is required');
    });

    it('should reject name longer than 100 chars', () => {
      expect(() => Zone.create({
        id: ZoneId.create(),
        circleId: CircleId.create(),
        name: 'a'.repeat(101),
        colorHex: ColorHex.create('#FF5733'),
        polygon: ZonePolygon.create(validPolygonVertices),
      })).toThrow('100 characters');
    });
  });

  describe('updateName', () => {
    it('should update the name', () => {
      const zone = createValidZone();
      zone.updateName('School Zone', 'School Zone');
      expect(zone.getName()).toBe('School Zone');
      expect(zone.getNameEn()).toBe('School Zone');
    });

    it('should reject empty name', () => {
      const zone = createValidZone();
      expect(() => zone.updateName('')).toThrow();
    });
  });

  describe('updateColor', () => {
    it('should update the color', () => {
      const zone = createValidZone();
      const newColor = ColorHex.create('#00FF00');
      zone.updateColor(newColor);
      expect(zone.getColorHex().getValue()).toBe('#00FF00');
    });
  });

  describe('updatePolygon', () => {
    it('should update the polygon', () => {
      const zone = createValidZone();
      const newVertices = [
        { lat: 41.0, lng: -4.0 },
        { lat: 41.1, lng: -3.9 },
        { lat: 40.9, lng: -3.9 },
      ];
      const newPolygon = ZonePolygon.create(newVertices);
      zone.updatePolygon(newPolygon);
      expect(zone.getPolygon().getVertexCount()).toBe(3);
    });
  });

  describe('deactivate/activate', () => {
    it('should deactivate a zone', () => {
      const zone = createValidZone();
      zone.deactivate();
      expect(zone.isActive()).toBe(false);
    });

    it('should activate a zone', () => {
      const zone = createValidZone();
      zone.deactivate();
      zone.activate();
      expect(zone.isActive()).toBe(true);
    });
  });

  describe('getAreaSqm', () => {
    it('should return the polygon area', () => {
      const zone = createValidZone();
      expect(zone.getAreaSqm()).toBeGreaterThan(100);
    });
  });
});
