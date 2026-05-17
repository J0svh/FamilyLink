import { describe, it, expect } from 'vitest';
import { ZoneEvaluationService } from '../../../../src/domain/services/ZoneEvaluationService';
import { Zone } from '../../../../src/domain/entities/Zone';
import { ZoneId } from '../../../../src/domain/value-objects/ZoneId';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';
import { ColorHex } from '../../../../src/domain/value-objects/ColorHex';
import { ZonePolygon } from '../../../../src/domain/value-objects/ZonePolygon';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';

describe('ZoneEvaluationService', () => {
  const service = new ZoneEvaluationService();

  // Square zone: roughly 40.41-40.42 lat, -3.71 to -3.70 lng
  const squareVertices = [
    { lat: 40.41, lng: -3.71 },
    { lat: 40.42, lng: -3.71 },
    { lat: 40.42, lng: -3.70 },
    { lat: 40.41, lng: -3.70 },
  ];

  // Triangle zone: different area
  const triangleVertices = [
    { lat: 40.43, lng: -3.71 },
    { lat: 40.44, lng: -3.70 },
    { lat: 40.43, lng: -3.69 },
  ];

  const createZone = (vertices: { lat: number; lng: number }[], active = true) => {
    const zone = Zone.create({
      id: ZoneId.create(),
      circleId: CircleId.create(),
      name: 'Test Zone',
      colorHex: ColorHex.create('#FF0000'),
      polygon: ZonePolygon.create(vertices),
      active,
    });
    return zone;
  };

  describe('evaluatePoint', () => {
    it('should detect point inside a convex polygon', () => {
      const zone = createZone(squareVertices);
      const point = Coordinates.create(40.415, -3.705);
      const result = service.evaluatePoint(point, [zone]);
      expect(result.length).toBe(1);
    });

    it('should not detect point outside polygon', () => {
      const zone = createZone(squareVertices);
      const point = Coordinates.create(40.50, -3.50); // far away
      const result = service.evaluatePoint(point, [zone]);
      expect(result.length).toBe(0);
    });

    it('should ignore inactive zones', () => {
      const zone = createZone(squareVertices, false);
      const point = Coordinates.create(40.415, -3.705);
      const result = service.evaluatePoint(point, [zone]);
      expect(result.length).toBe(0);
    });

    it('should detect point in multiple zones', () => {
      // Create overlapping zones
      const zone1 = createZone(squareVertices);
      const zone2 = createZone([
        { lat: 40.40, lng: -3.72 },
        { lat: 40.43, lng: -3.72 },
        { lat: 40.43, lng: -3.69 },
        { lat: 40.40, lng: -3.69 },
      ]);
      const point = Coordinates.create(40.415, -3.705);
      const result = service.evaluatePoint(point, [zone1, zone2]);
      expect(result.length).toBe(2);
    });

    it('should work with concave polygon', () => {
      // L-shaped polygon (concave)
      const concave = [
        { lat: 40.40, lng: -3.72 },
        { lat: 40.42, lng: -3.72 },
        { lat: 40.42, lng: -3.71 },
        { lat: 40.41, lng: -3.71 },
        { lat: 40.41, lng: -3.70 },
        { lat: 40.40, lng: -3.70 },
      ];
      const zone = createZone(concave);

      // Point in the "bottom" of the L
      const insidePoint = Coordinates.create(40.405, -3.715);
      expect(service.evaluatePoint(insidePoint, [zone]).length).toBe(1);

      // Point in the "notch" of the L (outside)
      const outsidePoint = Coordinates.create(40.415, -3.705);
      expect(service.evaluatePoint(outsidePoint, [zone]).length).toBe(0);
    });
  });

  describe('evaluateTransitions', () => {
    it('should detect zone entry when previous was null', () => {
      const zone = createZone(squareVertices);
      const newCoords = Coordinates.create(40.415, -3.705);
      const transitions = service.evaluateTransitions(null, newCoords, [zone]);
      expect(transitions.length).toBe(1);
      expect(transitions[0].type).toBe('entered');
    });

    it('should detect zone entry', () => {
      const zone = createZone(squareVertices);
      const prev = Coordinates.create(40.50, -3.50); // outside
      const next = Coordinates.create(40.415, -3.705); // inside
      const transitions = service.evaluateTransitions(prev, next, [zone]);
      expect(transitions.length).toBe(1);
      expect(transitions[0].type).toBe('entered');
    });

    it('should detect zone exit', () => {
      const zone = createZone(squareVertices);
      const prev = Coordinates.create(40.415, -3.705); // inside
      const next = Coordinates.create(40.50, -3.50); // outside
      const transitions = service.evaluateTransitions(prev, next, [zone]);
      expect(transitions.length).toBe(1);
      expect(transitions[0].type).toBe('exited');
    });

    it('should return empty when staying inside', () => {
      const zone = createZone(squareVertices);
      const prev = Coordinates.create(40.415, -3.705);
      const next = Coordinates.create(40.416, -3.706);
      const transitions = service.evaluateTransitions(prev, next, [zone]);
      expect(transitions.length).toBe(0);
    });

    it('should return empty when staying outside', () => {
      const zone = createZone(squareVertices);
      const prev = Coordinates.create(40.50, -3.50);
      const next = Coordinates.create(40.51, -3.51);
      const transitions = service.evaluateTransitions(prev, next, [zone]);
      expect(transitions.length).toBe(0);
    });
  });
});
