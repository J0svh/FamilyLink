export interface UpdateZoneInputDTO {
  zoneId: string;
  circleId: string;
  userId: string;
  name?: string;
  nameEn?: string;
  colorHex?: string;
  vertices?: { lat: number; lng: number }[];
}

export interface UpdateZoneOutputDTO {
  zoneId: string;
  name: string;
  areaSqm: number;
}
