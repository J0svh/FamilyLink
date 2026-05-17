import { IZoneRepository } from '../../../src/domain/ports/IZoneRepository';
import { Zone } from '../../../src/domain/entities/Zone';
import { ZoneId } from '../../../src/domain/value-objects/ZoneId';
import { CircleId } from '../../../src/domain/value-objects/CircleId';

export class InMemoryZoneRepository implements IZoneRepository {
  private zones: Map<string, Zone> = new Map();

  async findById(id: ZoneId): Promise<Zone | null> {
    return this.zones.get(id.getValue()) ?? null;
  }

  async findByCircleId(circleId: CircleId): Promise<Zone[]> {
    const result: Zone[] = [];
    for (const zone of this.zones.values()) {
      if (zone.getCircleId().equals(circleId)) {
        result.push(zone);
      }
    }
    return result;
  }

  async save(zone: Zone): Promise<void> {
    this.zones.set(zone.getId().getValue(), zone);
  }

  async delete(id: ZoneId): Promise<void> {
    this.zones.delete(id.getValue());
  }

  async countByCircleId(circleId: CircleId): Promise<number> {
    let count = 0;
    for (const zone of this.zones.values()) {
      if (zone.getCircleId().equals(circleId)) {
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.zones.clear();
  }
}
