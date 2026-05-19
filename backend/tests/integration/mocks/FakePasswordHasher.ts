import { IPasswordHasher } from '../../../src/domain/ports/IPasswordHasher';

export class FakePasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed_${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }
}
