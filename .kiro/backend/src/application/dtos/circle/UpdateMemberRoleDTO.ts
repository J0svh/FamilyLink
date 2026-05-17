export interface UpdateMemberRoleInputDTO {
  circleId: string;
  requestingUserId: string;
  targetUserId: string;
  newRole: 'CIRCLE_ADMIN' | 'CIRCLE_MEMBER';
}
