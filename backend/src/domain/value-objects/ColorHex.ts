export class ColorHex {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(hex: string): ColorHex {
    if (!hex || typeof hex !== 'string') {
      throw new Error('Color hex is required');
    }

    const trimmed = hex.trim().toUpperCase();
    const hexRegex = /^#[0-9A-F]{6}$/;

    if (!hexRegex.test(trimmed)) {
      throw new Error(`Invalid color hex format. Expected #RRGGBB, got: ${hex}`);
    }

    return new ColorHex(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ColorHex): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
