export interface GetZonesByCircleInputDTO {
  circleId: string;
  userId: string;
}

export interface ZoneDTO {
  zoneId: string;
  name: string;
  nameEn?: string;
  colorHex: string;
  vertices: { lat: number; lng: number }[];
  areaSqm: number;
  active: boolean;
}

export interface GetZonesByCircleOutputDTO {
  circleId: string;
  zones: ZoneDTO[];
}
