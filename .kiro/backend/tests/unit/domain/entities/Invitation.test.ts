import { describe, it, expect } from 'vitest';
import { Invitation, InvitationStatus } from '../../../../src/domain/entities/Invitation';
import { InvitationId } from '../../../../src/domain/value-objects/InvitationId';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';
import { UserId } from '../../../../src/domain/value-objects/UserId';
import { Email } from '../../../../src/domain/value-objects/Email';

describe('Invitation Entity', () => {
  const createValidInvitation = (overrides?: Partial<{ expiresAt: Date; status: InvitationStatus }>) => {
    return Invitation.create({
      id: InvitationId.create(),
      circleId: CircleId.create(),
      invitedBy: UserId.create(),
      email: Email.create('invited@example.com'),
      expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: overrides?.status,
    });
  };

  describe('create', () => {
    it('should create a valid invitation', () => {
      const invitation = createValidInvitation();
      expect(invitation.getStatus()).toBe(InvitationStatus.PENDING);
      expect(invitation.isPending()).toBe(true);
    });

    it('should set default status to PENDING', () => {
      const invitation = createValidInvitation();
      expect(invitation.getStatus()).toBe(InvitationStatus.PENDING);
    });
  });

  describe('accept', () => {
    it('should accept a pending invitation', () => {
      const invitation = createValidInvitation();
      invitation.accept();
      expect(invitation.getStatus()).toBe(InvitationStatus.ACCEPTED);
    });

    it('should reject accepting a non-pending invitation', () => {
      const invitation = createValidInvitation();
      invitation.accept();
      expect(() => invitation.accept()).toThrow();
    });

    it('should reject accepting an expired invitation', () => {
      const invitation = createValidInvitation({
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
      });
      expect(() => invitation.accept()).toThrow('expired');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending invitation', () => {
      const invitation = createValidInvitation();
      invitation.cancel();
      expect(invitation.getStatus()).toBe(InvitationStatus.CANCELLED);
    });

    it('should reject cancelling a non-pending invitation', () => {
      const invitation = createValidInvitation();
      invitation.accept();
      expect(() => invitation.cancel()).toThrow();
    });
  });

  describe('expire', () => {
    it('should expire a pending invitation', () => {
      const invitation = createValidInvitation();
      invitation.expire();
      expect(invitation.getStatus()).toBe(InvitationStatus.EXPIRED);
    });

    it('should not change status if already accepted', () => {
      const invitation = createValidInvitation();
      invitation.accept();
      invitation.expire(); // should be no-op
      expect(invitation.getStatus()).toBe(InvitationStatus.ACCEPTED);
    });
  });

  describe('isExpired', () => {
    it('should return false for future expiry', () => {
      const invitation = createValidInvitation();
      expect(invitation.isExpired()).toBe(false);
    });

    it('should return true for past expiry', () => {
      const invitation = createValidInvitation({
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(invitation.isExpired()).toBe(true);
    });
  });
});
