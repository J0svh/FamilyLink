import { describe, it, expect } from 'vitest';
import { LocationUpdate } from '../../../../src/domain/entities/LocationUpdate';
import { UserId } from '../../../../src/domain/value-objects/UserId';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';
import { v4 as uuidv4 } from 'uuid';

describe('LocationUpdate Entity', () => {
  const createValid = () => LocationUpdate.create({
    id: uuidv4(),
    userId: UserId.create(),
    circleId: CircleId.create(),
    coordinates: Coordinates.create(40.4168, -3.7038),
    capturedAt: new Date(),
  });

  describe('create', () => {
    it('should create a valid location update', () => {
      const lu = createValid();
      expect(lu.getId()).toBeDefined();
      expect(lu.getCoordinates().getLatitude()).toBe(40.4168);
    });

    it('should set createdAt to now if not provided', () => {
      const before = new Date();
      const lu = createValid();
      const after = new Date();
      expect(lu.getCreatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lu.getCreatedAt().getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should reject missing id', () => {
      expect(() => LocationUpdate.create({
        id: '',
        userId: UserId.create(),
        circleId: CircleId.create(),
        coordinates: Coordinates.create(40, -3),
        capturedAt: new Date(),
      })).toThrow('id is required');
    });

    it('should reject missing coordinates', () => {
      expect(() => LocationUpdate.create({
        id: uuidv4(),
        userId: UserId.create(),
        circleId: CircleId.create(),
        coordinates: null as any,
        capturedAt: new Date(),
      })).toThrow('coordinates is required');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const lu = createValid();
      expect(Object.isFrozen(lu)).toBe(true);
    });
  });
});
