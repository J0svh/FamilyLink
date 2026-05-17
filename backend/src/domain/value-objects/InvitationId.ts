import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class InvitationId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(id?: string): InvitationId {
    if (id !== undefined) {
      if (!uuidValidate(id)) {
        throw new Error(`Invalid InvitationId: ${id}`);
      }
      return new InvitationId(id);
    }
    return new InvitationId(uuidv4());
  }

  static fromString(id: string): InvitationId {
    return InvitationId.create(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: InvitationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
