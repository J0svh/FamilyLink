export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface LoginOutputDTO {
  userId: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}
