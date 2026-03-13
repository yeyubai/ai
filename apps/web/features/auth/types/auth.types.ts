export type LoginRequest = {
  phone: string;
  code: string;
};

export type UserStatus = 'needs_onboarding' | 'active';

export type LoginResult = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userStatus: UserStatus;
};
