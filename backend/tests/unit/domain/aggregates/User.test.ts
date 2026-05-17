import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User } from '../../../../src/domain/aggregates/user/User';
import { UserId } from '../../../../src/domain/value-objects/UserId';
import { Email } from '../../../../src/domain/value-objects/Email';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';

describe('User Aggregate', () => {
  const createValidUser = () => User.create({
    id: UserId.create(),
    email: Email.create('user@example.com'),
    username: 'testuser',
    passwordHash: '$2b$10$hashedpassword',
  });

  describe('create', () => {
    it('should create a valid user', () => {
      const user = createValidUser();
      expect(user.getUsername()).toBe('testuser');
      expect(user.getEmail().getValue()).toBe('user@example.com');
      expect(user.getLanguage()).toBe('es');
    });

    it('should default language to es', () => {
      const user = createValidUser();
      expect(user.getLanguage()).toBe('es');
    });

    it('should reject empty username', () => {
      expect(() => User.create({
        id: UserId.create(),
        email: Email.create('user@example.com'),
        username: '',
        passwordHash: '$2b$10$hash',
      })).toThrow('Username is required');
    });

    it('should reject username longer than 50 chars', () => {
      expect(() => User.create({
        id: UserId.create(),
        email: Email.create('user@example.com'),
        username: 'a'.repeat(51),
        passwordHash: '$2b$10$hash',
      })).toThrow('50 characters');
    });

    it('should reject empty password hash', () => {
      expect(() => User.create({
        id: UserId.create(),
        email: Email.create('user@example.com'),
        username: 'testuser',
        passwordHash: '',
      })).toThrow('Password hash is required');
    });
  });

  describe('privacy mode', () => {
    it('should start with privacy mode inactive', () => {
      const user = createValidUser();
      expect(user.isPrivacyModeActive()).toBe(false);
    });

    it('should activate privacy mode', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      user.activatePrivacyMode(circleId, 30);
      expect(user.isPrivacyModeActive()).toBe(true);
    });

    it('should emit PrivacyModeActivated event', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      user.activatePrivacyMode(circleId, 30);
      const events = user.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventName).toBe('PrivacyModeActivated');
    });

    it('should deactivate privacy mode', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      user.activatePrivacyMode(circleId, 30);
      user.clearDomainEvents();
      user.deactivatePrivacyMode();
      expect(user.isPrivacyModeActive()).toBe(false);
      const events = user.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventName).toBe('PrivacyModeDeactivated');
    });

    it('should reject deactivation when not active', () => {
      const user = createValidUser();
      expect(() => user.deactivatePrivacyMode()).toThrow('not active');
    });

    it('should reject duration less than 15 minutes', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      expect(() => user.activatePrivacyMode(circleId, 14)).toThrow('at least 15');
    });

    it('should reject duration more than 480 minutes', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      expect(() => user.activatePrivacyMode(circleId, 481)).toThrow('at most 480');
    });

    it('should limit to 5 activations per day', () => {
      const user = createValidUser();
      const circleId = CircleId.create();

      for (let i = 0; i < 5; i++) {
        user.activatePrivacyMode(circleId, 15);
        // Manually deactivate to allow next activation
        user.deactivatePrivacyMode();
      }

      expect(() => user.activatePrivacyMode(circleId, 15)).toThrow('5 privacy mode activations');
    });

    it('should report remaining activations', () => {
      const user = createValidUser();
      expect(user.getPrivacyActivationsRemaining()).toBe(5);

      const circleId = CircleId.create();
      user.activatePrivacyMode(circleId, 15);
      user.deactivatePrivacyMode();
      expect(user.getPrivacyActivationsRemaining()).toBe(4);
    });
  });

  describe('updateUsername', () => {
    it('should update username', () => {
      const user = createValidUser();
      user.updateUsername('newname');
      expect(user.getUsername()).toBe('newname');
    });

    it('should reject empty username', () => {
      const user = createValidUser();
      expect(() => user.updateUsername('')).toThrow();
    });
  });

  describe('updateLanguage', () => {
    it('should update language', () => {
      const user = createValidUser();
      user.updateLanguage('en');
      expect(user.getLanguage()).toBe('en');
    });
  });

  describe('domain events', () => {
    it('should clear domain events', () => {
      const user = createValidUser();
      const circleId = CircleId.create();
      user.activatePrivacyMode(circleId, 30);
      expect(user.getDomainEvents().length).toBe(1);
      user.clearDomainEvents();
      expect(user.getDomainEvents().length).toBe(0);
    });
  });
});
