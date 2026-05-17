import { describe, it, expect } from 'vitest';
import { Circle } from '../../../../src/domain/aggregates/circle/Circle';
import { CircleRole } from '../../../../src/domain/aggregates/circle/CircleRole';
import { CircleId } from '../../../../src/domain/value-objects/CircleId';
import { UserId } from '../../../../src/domain/value-objects/UserId';

describe('Circle Aggregate', () => {
  const createValidCircle = () => {
    const creatorId = UserId.create();
    return { circle: Circle.create({
      id: CircleId.create(),
      name: 'Family Circle',
      createdBy: creatorId,
    }), creatorId };
  };

  describe('create', () => {
    it('should create a valid circle', () => {
      const { circle } = createValidCircle();
      expect(circle.getName()).toBe('Family Circle');
    });

    it('should add creator as admin', () => {
      const { circle, creatorId } = createValidCircle();
      expect(circle.isMember(creatorId)).toBe(true);
      expect(circle.isAdmin(creatorId)).toBe(true);
    });

    it('should emit CircleCreated event', () => {
      const { circle } = createValidCircle();
      const events = circle.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventName).toBe('CircleCreated');
    });

    it('should reject empty name', () => {
      expect(() => Circle.create({
        id: CircleId.create(),
        name: '',
        createdBy: UserId.create(),
      })).toThrow('name is required');
    });

    it('should reject name longer than 100 chars', () => {
      expect(() => Circle.create({
        id: CircleId.create(),
        name: 'a'.repeat(101),
        createdBy: UserId.create(),
      })).toThrow('100 characters');
    });
  });

  describe('member management', () => {
    it('should add a member', () => {
      const { circle } = createValidCircle();
      const newMember = UserId.create();
      circle.addMember(newMember);
      expect(circle.isMember(newMember)).toBe(true);
      expect(circle.getMemberCount()).toBe(2);
    });

    it('should reject adding duplicate member', () => {
      const { circle, creatorId } = createValidCircle();
      expect(() => circle.addMember(creatorId)).toThrow('already a member');
    });

    it('should remove a member', () => {
      const { circle } = createValidCircle();
      const newMember = UserId.create();
      circle.addMember(newMember);
      circle.removeMember(newMember);
      expect(circle.isMember(newMember)).toBe(false);
    });

    it('should reject removing non-member', () => {
      const { circle } = createValidCircle();
      const nonMember = UserId.create();
      expect(() => circle.removeMember(nonMember)).toThrow('not a member');
    });

    it('should reject removing the last admin', () => {
      const { circle, creatorId } = createValidCircle();
      expect(() => circle.removeMember(creatorId)).toThrow('last admin');
    });

    it('should allow removing admin if another admin exists', () => {
      const { circle, creatorId } = createValidCircle();
      const secondAdmin = UserId.create();
      circle.addMember(secondAdmin, CircleRole.CIRCLE_ADMIN);
      circle.removeMember(creatorId);
      expect(circle.isMember(creatorId)).toBe(false);
    });
  });

  describe('role management', () => {
    it('should promote member to admin', () => {
      const { circle } = createValidCircle();
      const member = UserId.create();
      circle.addMember(member);
      circle.updateMemberRole(member, CircleRole.CIRCLE_ADMIN);
      expect(circle.isAdmin(member)).toBe(true);
    });

    it('should demote admin to member', () => {
      const { circle } = createValidCircle();
      const secondAdmin = UserId.create();
      circle.addMember(secondAdmin, CircleRole.CIRCLE_ADMIN);
      circle.updateMemberRole(secondAdmin, CircleRole.CIRCLE_MEMBER);
      expect(circle.isAdmin(secondAdmin)).toBe(false);
    });

    it('should reject demoting the last admin', () => {
      const { circle, creatorId } = createValidCircle();
      expect(() => circle.updateMemberRole(creatorId, CircleRole.CIRCLE_MEMBER)).toThrow('last admin');
    });

    it('should reject updating role of non-member', () => {
      const { circle } = createValidCircle();
      const nonMember = UserId.create();
      expect(() => circle.updateMemberRole(nonMember, CircleRole.CIRCLE_ADMIN)).toThrow('not a member');
    });
  });

  describe('updateName', () => {
    it('should update circle name', () => {
      const { circle } = createValidCircle();
      circle.updateName('New Name');
      expect(circle.getName()).toBe('New Name');
    });

    it('should reject empty name', () => {
      const { circle } = createValidCircle();
      expect(() => circle.updateName('')).toThrow();
    });
  });

  describe('getAdmins', () => {
    it('should return all admins', () => {
      const { circle } = createValidCircle();
      const secondAdmin = UserId.create();
      circle.addMember(secondAdmin, CircleRole.CIRCLE_ADMIN);
      expect(circle.getAdmins().length).toBe(2);
    });
  });

  describe('domain events', () => {
    it('should clear domain events', () => {
      const { circle } = createValidCircle();
      expect(circle.getDomainEvents().length).toBe(1);
      circle.clearDomainEvents();
      expect(circle.getDomainEvents().length).toBe(0);
    });
  });
});
