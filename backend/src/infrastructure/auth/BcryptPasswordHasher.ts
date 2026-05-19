import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/ports/IPasswordHasher';

const SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
