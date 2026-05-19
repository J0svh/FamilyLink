import { IUserRepository } from '../../../src/domain/ports/IUserRepository';
import { User } from '../../../src/domain/aggregates/user/User';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Email } from '../../../src/domain/value-objects/Email';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.getValue()) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getEmail().equals(email)) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId().getValue(), user);
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.getValue());
  }

  // Test helpers
  clear(): void {
    this.users.clear();
  }

  count(): number {
    return this.users.size;
  }
}
