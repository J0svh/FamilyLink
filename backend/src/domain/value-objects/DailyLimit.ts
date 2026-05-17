export class DailyLimit {
  private constructor(private readonly value: number) {
    Object.freeze(this);
  }

  static create(limit: number): DailyLimit {
    if (typeof limit !== 'number' || isNaN(limit)) {
      throw new Error('Daily limit must be a valid number');
    }

    if (!Number.isInteger(limit)) {
      throw new Error(`Daily limit must be an integer, got: ${limit}`);
    }

    if (limit < 1 || limit > 500) {
      throw new Error(`Daily limit must be between 1 and 500, got: ${limit}`);
    }

    return new DailyLimit(limit);
  }

  getValue(): number {
    return this.value;
  }

  isExceeded(currentCount: number): boolean {
    return currentCount >= this.value;
  }

  equals(other: DailyLimit): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return `${this.value}`;
  }
}
