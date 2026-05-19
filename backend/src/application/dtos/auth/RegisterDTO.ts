export interface RegisterInputDTO {
  email: string;
  username: string;
  password: string;
  language?: string;
}

export interface RegisterOutputDTO {
  userId: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}
