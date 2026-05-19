export interface ActivatePrivacyInputDTO {
  userId: string;
  circleId: string;
  durationMinutes: number;
}

export interface ActivatePrivacyOutputDTO {
  expiresAt: Date;
  activationsRemaining: number;
}
