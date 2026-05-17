export interface RefreshTokenInputDTO {
  refreshToken: string;
}

export interface RefreshTokenOutputDTO {
  accessToken: string;
  refreshToken: string;
}
