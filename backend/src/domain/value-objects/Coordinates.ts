export class Coordinates {
  private constructor(
    private readonly lat: number,
    private readonly lng: number,
  ) {
    Object.freeze(this);
  }

  static create(lat: number, lng: number): Coordinates {
    if (typeof lat !== 'number' || isNaN(lat)) {
      throw new Error('Latitude must be a valid number');
    }
    if (typeof lng !== 'number' || isNaN(lng)) {
      throw new Error('Longitude must be a valid number');
    }
    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude must be between -90 and 90, got: ${lat}`);
    }
    if (lng < -180 || lng > 180) {
      throw new Error(`Longitude must be between -180 and 180, got: ${lng}`);
    }

    return new Coordinates(lat, lng);
  }

  getLatitude(): number {
    return this.lat;
  }

  getLongitude(): number {
    return this.lng;
  }

  equals(other: Coordinates): boolean {
    return this.lat === other.lat && this.lng === other.lng;
  }

  toString(): string {
    return `(${this.lat}, ${this.lng})`;
  }

  toJSON(): { lat: number; lng: number } {
    return { lat: this.lat, lng: this.lng };
  }
}
