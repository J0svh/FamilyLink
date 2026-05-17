import { describe, it, expect } from 'vitest';
import { Email } from '../../../../src/domain/value-objects/Email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize to lowercase', () => {
      const email = Email.create('Test@EXAMPLE.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user@sub.domain.com',
        'a@b.co',
      ];
      validEmails.forEach(e => {
        expect(() => Email.create(e)).not.toThrow();
      });
    });

    it('should reject empty string', () => {
      expect(() => Email.create('')).toThrow();
    });

    it('should reject null/undefined', () => {
      expect(() => Email.create(null as any)).toThrow();
      expect(() => Email.create(undefined as any)).toThrow();
    });

    it('should reject invalid formats', () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user@.com',
        'user space@domain.com',
      ];
      invalidEmails.forEach(e => {
        expect(() => Email.create(e)).toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email different case', () => {
      const email1 = Email.create('Test@Example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the email string', () => {
      const email = Email.create('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const email = Email.create('test@example.com');
      expect(Object.isFrozen(email)).toBe(true);
    });
  });
});
