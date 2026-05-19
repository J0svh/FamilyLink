import { Coordinates } from '../value-objects/Coordinates';
import { Zone } from '../entities/Zone';
import { Vertex } from '../value-objects/ZonePolygon';

export interface ZoneTransition {
  zone: Zone;
  type: 'entered' | 'exited';
}

export class ZoneEvaluationService {
  /**
   * Evaluates whether a point (location) is inside any of the given zones.
   * Returns the list of zones that contain the point.
   */
  evaluatePoint(coordinates: Coordinates, zones: Zone[]): Zone[] {
    const activeZones = zones.filter(z => z.isActive());
    return activeZones.filter(zone => this.isPointInPolygon(coordinates, zone));
  }

  /**
   * Evaluates zone transitions between a previous location and a new location.
   * Returns which zones were entered and which were exited.
   */
  evaluateTransitions(
    previousCoordinates: Coordinates | null,
    newCoordinates: Coordinates,
    zones: Zone[],
  ): ZoneTransition[] {
    const activeZones = zones.filter(z => z.isActive());
    const transitions: ZoneTransition[] = [];

    const previousZones = previousCoordinates
      ? new Set(activeZones.filter(z => this.isPointInPolygon(previousCoordinates, z)).map(z => z.getId().getValue()))
      : new Set<string>();

    const currentZones = new Set(
      activeZones.filter(z => this.isPointInPolygon(newCoordinates, z)).map(z => z.getId().getValue()),
    );

    // Zones entered: in current but not in previous
    for (const zone of activeZones) {
      const zoneId = zone.getId().getValue();
      if (currentZones.has(zoneId) && !previousZones.has(zoneId)) {
        transitions.push({ zone, type: 'entered' });
      }
      if (!currentZones.has(zoneId) && previousZones.has(zoneId)) {
        transitions.push({ zone, type: 'exited' });
      }
    }

    return transitions;
  }

  /**
   * Ray-casting algorithm to determine if a point is inside a polygon.
   * Casts a ray from the point to the right and counts intersections.
   * Odd number of intersections = inside.
   */
  private isPointInPolygon(coordinates: Coordinates, zone: Zone): boolean {
    const vertices = zone.getPolygon().getVertices();
    const lat = coordinates.getLatitude();
    const lng = coordinates.getLongitude();

    return this.raycast(lat, lng, vertices);
  }

  private raycast(lat: number, lng: number, vertices: ReadonlyArray<Vertex>): boolean {
    const n = vertices.length;
    let inside = false;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];

      if (
        (vi.lat > lat) !== (vj.lat > lat) &&
        lng < ((vj.lng - vi.lng) * (lat - vi.lat)) / (vj.lat - vi.lat) + vi.lng
      ) {
        inside = !inside;
      }
    }

    return inside;
  }
}
