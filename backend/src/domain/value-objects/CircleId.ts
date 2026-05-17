import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class CircleId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(id?: string): CircleId {
    if (id !== undefined) {
      if (!uuidValidate(id)) {
        throw new Error(`Invalid CircleId: ${id}`);
      }
      return new CircleId(id);
    }
    return new CircleId(uuidv4());
  }

  static fromString(id: string): CircleId {
    return CircleId.create(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CircleId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
