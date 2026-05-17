import { Zone } from '../entities/Zone';
import { Coordinates } from '../value-objects/Coordinates';

export interface ZoneTransition {
  zone: Zone;
  type: 'entered' | 'exited';
}

export class ZoneEvaluationService {
  /**
   * Evaluates which active zones contain the given point.
   * Uses ray-casting algorithm for point-in-polygon detection.
   */
  evaluatePoint(point: Coordinates, zones: Zone[]): Zone[] {
    return zones.filter(zone => {
      if (!zone.isActive()) return false;
      return this.isPointInPolygon(point, zone);
    });
  }

  /**
   * Evaluates zone transitions between two coordinate positions.
   * Returns zones that were entered or exited.
   */
  evaluateTransitions(
    previousCoords: Coordinates | null,
    newCoords: Coordinates,
    zones: Zone[],
  ): ZoneTransition[] {
    const transitions: ZoneTransition[] = [];

    const activeZones = zones.filter(z => z.isActive());

    const previousZones = previousCoords
      ? this.evaluatePoint(previousCoords, activeZones)
      : [];
    const currentZones = this.evaluatePoint(newCoords, activeZones);

    // Detect entries: in current but not in previous
    for (const zone of currentZones) {
      const wasInZone = previousZones.some(
        pz => pz.getId().equals(zone.getId()),
      );
      if (!wasInZone) {
        transitions.push({ zone, type: 'entered' });
      }
    }

    // Detect exits: in previous but not in current
    for (const zone of previousZones) {
      const isInZone = currentZones.some(
        cz => cz.getId().equals(zone.getId()),
      );
      if (!isInZone) {
        transitions.push({ zone, type: 'exited' });
      }
    }

    return transitions;
  }

  /**
   * Ray-casting algorithm for point-in-polygon detection.
   * Works for both convex and concave polygons.
   */
  private isPointInPolygon(point: Coordinates, zone: Zone): boolean {
    const vertices = zone.getPolygon().getVertices();
    const n = vertices.length;
    const lat = point.getLatitude();
    const lng = point.getLongitude();

    let inside = false;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];

      if (
        (vi.lng > lng) !== (vj.lng > lng) &&
        lat < ((vj.lat - vi.lat) * (lng - vi.lng)) / (vj.lng - vi.lng) + vi.lat
      ) {
        inside = !inside;
      }
    }

    return inside;
  }
}
