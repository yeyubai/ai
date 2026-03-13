export type LoginRequest = {
  phone: string;
  code: string;
};

export type LoginResult = {
  token: string;
  refreshToken: string;
  expiresIn: number;
};
