import { Coordinates } from './Coordinates';

export interface Vertex {
  lat: number;
  lng: number;
}

export class ZonePolygon {
  private constructor(
    private readonly vertices: ReadonlyArray<Vertex>,
    private readonly areaSqm: number,
  ) {
    Object.freeze(this);
  }

  static create(vertices: Vertex[]): ZonePolygon {
    if (!Array.isArray(vertices)) {
      throw new Error('Vertices must be an array');
    }

    if (vertices.length < 3) {
      throw new Error(`Polygon must have at least 3 vertices, got: ${vertices.length}`);
    }

    if (vertices.length > 50) {
      throw new Error(`Polygon must have at most 50 vertices, got: ${vertices.length}`);
    }

    // Validate each vertex
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      if (typeof v.lat !== 'number' || typeof v.lng !== 'number') {
        throw new Error(`Vertex ${i} must have numeric lat and lng`);
      }
      if (v.lat < -90 || v.lat > 90) {
        throw new Error(`Vertex ${i} latitude must be between -90 and 90`);
      }
      if (v.lng < -180 || v.lng > 180) {
        throw new Error(`Vertex ${i} longitude must be between -180 and 180`);
      }
    }

    // Check for self-intersection
    if (ZonePolygon.hasSelfIntersection(vertices)) {
      throw new Error('Polygon must not self-intersect');
    }

    // Calculate area in square meters
    const area = ZonePolygon.calculateAreaSqm(vertices);

    if (area < 100) {
      throw new Error(`Polygon area must be at least 100 m2, got: ${area.toFixed(2)} m2`);
    }

    return new ZonePolygon([...vertices], area);
  }

  getVertices(): ReadonlyArray<Vertex> {
    return this.vertices;
  }

  getAreaSqm(): number {
    return this.areaSqm;
  }

  getVertexCount(): number {
    return this.vertices.length;
  }

  equals(other: ZonePolygon): boolean {
    if (this.vertices.length !== other.vertices.length) return false;
    return this.vertices.every(
      (v, i) => v.lat === other.vertices[i].lat && v.lng === other.vertices[i].lng,
    );
  }

  toString(): string {
    return `ZonePolygon(${this.vertices.length} vertices, ${this.areaSqm.toFixed(0)} m2)`;
  }

  /**
   * Calculate polygon area in square meters using the Shoelface formula
   * with latitude correction for approximate metric conversion.
   */
  private static calculateAreaSqm(vertices: Vertex[]): number {
    const n = vertices.length;
    let area = 0;

    // Shoelface formula in geographic coordinates
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].lng * vertices[j].lat;
      area -= vertices[j].lng * vertices[i].lat;
    }

    area = Math.abs(area) / 2;

    // Convert from degrees2 to m2 (approximate)
    // 1 degree latitude ~ 111,320 m
    // 1 degree longitude ~ 111,320 * cos(avg_lat) m
    const avgLat = vertices.reduce((sum, v) => sum + v.lat, 0) / n;
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((avgLat * Math.PI) / 180);

    return area * latMeters * lngMeters;
  }

  /**
   * Check if polygon edges self-intersect using line segment intersection.
   */
  private static hasSelfIntersection(vertices: Vertex[]): boolean {
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        // Skip adjacent edges (they share a vertex)
        if (i === 0 && j === n - 1) continue;

        const a1 = vertices[i];
        const a2 = vertices[(i + 1) % n];
        const b1 = vertices[j];
        const b2 = vertices[(j + 1) % n];

        if (ZonePolygon.segmentsIntersect(a1, a2, b1, b2)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if two line segments intersect using cross product method.
   */
  private static segmentsIntersect(a1: Vertex, a2: Vertex, b1: Vertex, b2: Vertex): boolean {
    const d1 = ZonePolygon.cross(b1, b2, a1);
    const d2 = ZonePolygon.cross(b1, b2, a2);
    const d3 = ZonePolygon.cross(a1, a2, b1);
    const d4 = ZonePolygon.cross(a1, a2, b2);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    // Collinear cases
    if (d1 === 0 && ZonePolygon.onSegment(b1, b2, a1)) return true;
    if (d2 === 0 && ZonePolygon.onSegment(b1, b2, a2)) return true;
    if (d3 === 0 && ZonePolygon.onSegment(a1, a2, b1)) return true;
    if (d4 === 0 && ZonePolygon.onSegment(a1, a2, b2)) return true;

    return false;
  }

  private static cross(o: Vertex, a: Vertex, b: Vertex): number {
    return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
  }

  private static onSegment(p: Vertex, q: Vertex, r: Vertex): boolean {
    return (
      Math.min(p.lat, q.lat) <= r.lat &&
      r.lat <= Math.max(p.lat, q.lat) &&
      Math.min(p.lng, q.lng) <= r.lng &&
      r.lng <= Math.max(p.lng, q.lng)
    );
  }
}
