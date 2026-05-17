import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UserId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(id?: string): UserId {
    if (id !== undefined) {
      if (!uuidValidate(id)) {
        throw new Error(`Invalid UserId: ${id}`);
      }
      return new UserId(id);
    }
    return new UserId(uuidv4());
  }

  static fromString(id: string): UserId {
    return UserId.create(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
