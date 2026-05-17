import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class ZoneId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(id?: string): ZoneId {
    if (id !== undefined) {
      if (!uuidValidate(id)) {
        throw new Error(`Invalid ZoneId: ${id}`);
      }
      return new ZoneId(id);
    }
    return new ZoneId(uuidv4());
  }

  static fromString(id: string): ZoneId {
    return ZoneId.create(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ZoneId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
