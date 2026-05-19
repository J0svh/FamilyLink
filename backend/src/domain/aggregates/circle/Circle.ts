import { CircleId } from '../../value-objects/CircleId';
import { UserId } from '../../value-objects/UserId';

import { DomainEvent } from '../../events/DomainEvent';
import { CircleCreated } from '../../events/CircleCreated';

import { CircleMember } from './CircleMember';
import { CircleRole } from './CircleRole';

export interface CircleProps {
  id: CircleId;
  name: string;
  createdBy: UserId;
  members?: CircleMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Circle {
  private _id: CircleId;
  private _name: string;
  private _createdBy: UserId;
  private _members: CircleMember[];
  private _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  private static readonly MAX_ZONES_PER_CIRCLE = 20;
  private static readonly MAX_CIRCLES_PER_USER = 10;

  private constructor(props: CircleProps) {
    this._id = props.id;
    this._name = props.name;
    this._createdBy = props.createdBy;
    this._members = props.members ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: CircleProps): Circle {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Circle name is required');
    }
    if (props.name.length > 100) {
      throw new Error('Circle name must be 100 characters or less');
    }

    const circle = new Circle(props);

    // If no members provided, add creator as admin
    if (circle._members.length === 0) {
      circle._members.push(new CircleMember({
        userId: props.createdBy,
        role: CircleRole.CIRCLE_ADMIN,
      }));
    }

    circle._domainEvents.push(new CircleCreated(props.id, props.createdBy));

    return circle;
  }

  static reconstitute(props: CircleProps): Circle {
    return new Circle(props);
  }

  getId(): CircleId { return this._id; }
  getName(): string { return this._name; }
  getCreatedBy(): UserId { return this._createdBy; }
  getMembers(): ReadonlyArray<CircleMember> { return this._members; }
  getMemberCount(): number { return this._members.length; }
  getCreatedAt(): Date { return this._createdAt; }
  getUpdatedAt(): Date { return this._updatedAt; }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  static getMaxZonesPerCircle(): number {
    return Circle.MAX_ZONES_PER_CIRCLE;
  }

  static getMaxCirclesPerUser(): number {
    return Circle.MAX_CIRCLES_PER_USER;
  }

  // --- Member management ---

  isMember(userId: UserId): boolean {
    return this._members.some(m => m.getUserId().equals(userId));
  }

  isAdmin(userId: UserId): boolean {
    return this._members.some(m => m.getUserId().equals(userId) && m.isAdmin());
  }

  getMember(userId: UserId): CircleMember | undefined {
    return this._members.find(m => m.getUserId().equals(userId));
  }

  addMember(userId: UserId, role: CircleRole = CircleRole.CIRCLE_MEMBER): void {
    if (this.isMember(userId)) {
      throw new Error('User is already a member of this circle');
    }
    this._members.push(new CircleMember({ userId, role }));
    this._updatedAt = new Date();
  }

  removeMember(userId: UserId): void {
    const member = this.getMember(userId);
    if (!member) {
      throw new Error('User is not a member of this circle');
    }

    // Cannot remove the last admin
    if (member.isAdmin()) {
      const adminCount = this._members.filter(m => m.isAdmin()).length;
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin from the circle');
      }
    }

    this._members = this._members.filter(m => !m.getUserId().equals(userId));
    this._updatedAt = new Date();
  }

  updateMemberRole(userId: UserId, newRole: CircleRole): void {
    const member = this.getMember(userId);
    if (!member) {
      throw new Error('User is not a member of this circle');
    }

    // If demoting an admin, ensure at least one admin remains
    if (member.isAdmin() && newRole === CircleRole.CIRCLE_MEMBER) {
      const adminCount = this._members.filter(m => m.isAdmin()).length;
      if (adminCount <= 1) {
        throw new Error('Cannot demote the last admin');
      }
    }

    if (newRole === CircleRole.CIRCLE_ADMIN) {
      member.promoteToAdmin();
    } else {
      member.demoteToMember();
    }

    this._updatedAt = new Date();
  }

  // --- Circle management ---

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Circle name is required');
    }
    if (name.length > 100) {
      throw new Error('Circle name must be 100 characters or less');
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  getAdmins(): CircleMember[] {
    return this._members.filter(m => m.isAdmin());
  }

  hasAtLeastOneAdmin(): boolean {
    return this._members.some(m => m.isAdmin());
  }
}