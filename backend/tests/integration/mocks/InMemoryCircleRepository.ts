import { ICircleRepository } from '../../../src/domain/ports/ICircleRepository';
import { Circle } from '../../../src/domain/aggregates/circle/Circle';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { UserId } from '../../../src/domain/value-objects/UserId';

export class InMemoryCircleRepository implements ICircleRepository {
  private circles: Map<string, Circle> = new Map();

  async findById(id: CircleId): Promise<Circle | null> {
    return this.circles.get(id.getValue()) ?? null;
  }

  async findByMemberId(userId: UserId): Promise<Circle[]> {
    const result: Circle[] = [];
    for (const circle of this.circles.values()) {
      if (circle.isMember(userId)) {
        result.push(circle);
      }
    }
    return result;
  }

  async save(circle: Circle): Promise<void> {
    this.circles.set(circle.getId().getValue(), circle);
  }

  async delete(id: CircleId): Promise<void> {
    this.circles.delete(id.getValue());
  }

  async countByMemberId(userId: UserId): Promise<number> {
    let count = 0;
    for (const circle of this.circles.values()) {
      if (circle.isMember(userId)) {
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.circles.clear();
  }
}
