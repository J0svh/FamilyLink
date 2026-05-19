export interface UpdateDailyLimitsInputDTO {
  circleId: string;
  requestingUserId: string;
  targetUserId: string;
  limit: number;
}
