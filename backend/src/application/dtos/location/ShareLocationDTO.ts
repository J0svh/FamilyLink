export interface ShareLocationInputDTO {
  userId: string;
  circleId: string;
  latitude: number;
  longitude: number;
}

export interface ShareLocationOutputDTO {
  locationId: string;
  capturedAt: Date;
  zonesEntered: string[];
  zonesExited: string[];
}
