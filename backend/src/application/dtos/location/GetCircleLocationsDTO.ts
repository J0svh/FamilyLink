export interface GetCircleLocationsInputDTO {
  circleId: string;
  requestingUserId: string;
}

export interface MemberLocationDTO {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  capturedAt: Date;
  isPrivacyModeActive: boolean;
}

export interface GetCircleLocationsOutputDTO {
  circleId: string;
  members: MemberLocationDTO[];
}
