import { UserId } from '../../value-objects/UserId';
import { CircleRole } from './CircleRole';

export interface CircleMemberProps {
  userId: UserId;
  role: CircleRole;
  joinedAt?: Date;
}

export class CircleMember {
  private _userId: UserId;
  private _role: CircleRole;
  private _joinedAt: Date;

  constructor(props: CircleMemberProps) {
    this._userId = props.userId;
    this._role = props.role;
    this._joinedAt = props.joinedAt ?? new Date();
  }

  getUserId(): UserId { return this._userId; }
  getRole(): CircleRole { return this._role; }
  getJoinedAt(): Date { return this._joinedAt; }

  isAdmin(): boolean {
    return this._role === CircleRole.CIRCLE_ADMIN;
  }

  promoteToAdmin(): void {
    this._role = CircleRole.CIRCLE_ADMIN;
  }

  demoteToMember(): void {
    this._role = CircleRole.CIRCLE_MEMBER;
  }
}
