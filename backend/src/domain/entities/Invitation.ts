import { InvitationId } from '../value-objects/InvitationId';
import { CircleId } from '../value-objects/CircleId';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface InvitationProps {
  id: InvitationId;
  circleId: CircleId;
  invitedBy: UserId;
  email: Email;
  status?: InvitationStatus;
  expiresAt: Date;
  createdAt?: Date;
}

export class Invitation {
  private _id: InvitationId;
  private _circleId: CircleId;
  private _invitedBy: UserId;
  private _email: Email;
  private _status: InvitationStatus;
  private _expiresAt: Date;
  private _createdAt: Date;

  private constructor(props: InvitationProps) {
    this._id = props.id;
    this._circleId = props.circleId;
    this._invitedBy = props.invitedBy;
    this._email = props.email;
    this._status = props.status ?? InvitationStatus.PENDING;
    this._expiresAt = props.expiresAt;
    this._createdAt = props.createdAt ?? new Date();
  }

  static create(props: InvitationProps): Invitation {
    if (!props.expiresAt) {
      throw new Error('Invitation expiresAt is required');
    }
    return new Invitation(props);
  }

  getId(): InvitationId { return this._id; }
  getCircleId(): CircleId { return this._circleId; }
  getInvitedBy(): UserId { return this._invitedBy; }
  getEmail(): Email { return this._email; }
  getStatus(): InvitationStatus { return this._status; }
  getExpiresAt(): Date { return this._expiresAt; }
  getCreatedAt(): Date { return this._createdAt; }

  isPending(): boolean {
    return this._status === InvitationStatus.PENDING;
  }

  isExpired(): boolean {
    return this._status === InvitationStatus.EXPIRED || new Date() > this._expiresAt;
  }

  accept(): void {
    if (!this.isPending()) {
      throw new Error(`Cannot accept invitation with status: ${this._status}`);
    }
    if (this.isExpired()) {
      throw new Error('Cannot accept expired invitation');
    }
    this._status = InvitationStatus.ACCEPTED;
  }

  cancel(): void {
    if (!this.isPending()) {
      throw new Error(`Cannot cancel invitation with status: ${this._status}`);
    }
    this._status = InvitationStatus.CANCELLED;
  }

  expire(): void {
    if (this._status === InvitationStatus.PENDING) {
      this._status = InvitationStatus.EXPIRED;
    }
  }
}
