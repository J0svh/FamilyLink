export interface InviteMemberInputDTO {
  circleId: string;
  invitedByUserId: string;
  email: string;
}

export interface InviteMemberOutputDTO {
  invitationId: string;
  email: string;
  expiresAt: Date;
}
