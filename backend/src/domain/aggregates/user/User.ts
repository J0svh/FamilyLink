import { UserId } from '../../value-objects/UserId';
import { Email } from '../../value-objects/Email';
import { CircleId } from '../../value-objects/CircleId';
import { DomainEvent } from '../../events/DomainEvent';
import { PrivacyModeActivated } from '../../events/PrivacyModeActivated';
import { PrivacyModeDeactivated } from '../../events/PrivacyModeDeactivated';

export interface PrivacyModeState {
  active: boolean;
  circleId: CircleId | null;
  expiresAt: Date | null;
  activationsToday: number;
  activationsResetAt: Date | null;
}

export interface UserProps {
  id: UserId;
  email: Email;
  username: string;
  passwordHash: string;
  language?: string;
  privacyMode?: PrivacyModeState;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private _id: UserId;
  private _email: Email;
  private _username: string;
  private _passwordHash: string;
  private _language: string;
  private _privacyMode: PrivacyModeState;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  private static readonly MAX_PRIVACY_ACTIVATIONS_PER_DAY = 5;
  private static readonly MIN_PRIVACY_DURATION_MINUTES = 15;
  private static readonly MAX_PRIVACY_DURATION_MINUTES = 480; // 8 hours

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._language = props.language ?? 'es';
    this._privacyMode = props.privacyMode ?? {
      active: false,
      circleId: null,
      expiresAt: null,
      activationsToday: 0,
      activationsResetAt: null,
    };
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: UserProps): User {
    if (!props.username || props.username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (props.username.length > 50) {
      throw new Error('Username must be 50 characters or less');
    }
    if (!props.passwordHash) {
      throw new Error('Password hash is required');
    }
    return new User(props);
  }

  getId(): UserId { return this._id; }
  getEmail(): Email { return this._email; }
  getUsername(): string { return this._username; }
  getPasswordHash(): string { return this._passwordHash; }
  getLanguage(): string { return this._language; }
  getPrivacyMode(): PrivacyModeState { return { ...this._privacyMode }; }
  getCreatedAt(): Date { return this._createdAt; }
  getUpdatedAt(): Date { return this._updatedAt; }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  isPrivacyModeActive(): boolean {
    if (!this._privacyMode.active) return false;
    // Check if expired
    if (this._privacyMode.expiresAt && new Date() > this._privacyMode.expiresAt) {
      this._privacyMode.active = false;
      this._privacyMode.expiresAt = null;
      this._privacyMode.circleId = null;
      return false;
    }
    return true;
  }

  activatePrivacyMode(circleId: CircleId, durationMinutes: number): void {
    if (durationMinutes < User.MIN_PRIVACY_DURATION_MINUTES) {
      throw new Error(`Privacy mode duration must be at least ${User.MIN_PRIVACY_DURATION_MINUTES} minutes`);
    }
    if (durationMinutes > User.MAX_PRIVACY_DURATION_MINUTES) {
      throw new Error(`Privacy mode duration must be at most ${User.MAX_PRIVACY_DURATION_MINUTES} minutes (8 hours)`);
    }

    // Reset daily counter if needed
    this.resetDailyActivationsIfNeeded();

    if (this._privacyMode.activationsToday >= User.MAX_PRIVACY_ACTIVATIONS_PER_DAY) {
      throw new Error(`Maximum ${User.MAX_PRIVACY_ACTIVATIONS_PER_DAY} privacy mode activations per day reached`);
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    this._privacyMode = {
      active: true,
      circleId,
      expiresAt,
      activationsToday: this._privacyMode.activationsToday + 1,
      activationsResetAt: this._privacyMode.activationsResetAt ?? this.getEndOfDayUTC(),
    };

    this._updatedAt = new Date();

    this._domainEvents.push(new PrivacyModeActivated(
      this._id,
      circleId,
      expiresAt,
    ));
  }

  deactivatePrivacyMode(): void {
    if (!this._privacyMode.active) {
      throw new Error('Privacy mode is not active');
    }

    const circleId = this._privacyMode.circleId!;

    this._privacyMode = {
      ...this._privacyMode,
      active: false,
      expiresAt: null,
      circleId: null,
    };

    this._updatedAt = new Date();

    this._domainEvents.push(new PrivacyModeDeactivated(
      this._id,
      circleId,
      new Date(),
    ));
  }

  updateUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (username.length > 50) {
      throw new Error('Username must be 50 characters or less');
    }
    this._username = username;
    this._updatedAt = new Date();
  }

  updateLanguage(language: string): void {
    this._language = language;
    this._updatedAt = new Date();
  }

  updatePassword(passwordHash: string): void {
    if (!passwordHash) {
      throw new Error('Password hash is required');
    }
    this._passwordHash = passwordHash;
    this._updatedAt = new Date();
  }

  getPrivacyActivationsRemaining(): number {
    this.resetDailyActivationsIfNeeded();
    return User.MAX_PRIVACY_ACTIVATIONS_PER_DAY - this._privacyMode.activationsToday;
  }

  private resetDailyActivationsIfNeeded(): void {
    if (this._privacyMode.activationsResetAt && new Date() > this._privacyMode.activationsResetAt) {
      this._privacyMode.activationsToday = 0;
      this._privacyMode.activationsResetAt = this.getEndOfDayUTC();
    }
  }

  private getEndOfDayUTC(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  }
}
