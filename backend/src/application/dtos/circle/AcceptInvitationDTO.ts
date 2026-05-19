export interface AcceptInvitationInputDTO {
  invitationId: string;
  userId: string;
}

export interface AcceptInvitationOutputDTO {
  circleId: string;
  circleName: string;
  role: string;
}
