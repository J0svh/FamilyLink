export class Email {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    const trimmed = email.trim().toLowerCase();

    // RFC 5322 simplified regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmed)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    return new Email(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
