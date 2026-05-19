export interface CreateZoneInputDTO {
  circleId: string;
  userId: string;
  name: string;
  nameEn?: string;
  colorHex: string;
  vertices: { lat: number; lng: number }[];
}

export interface CreateZoneOutputDTO {
  zoneId: string;
  name: string;
  areaSqm: number;
}
