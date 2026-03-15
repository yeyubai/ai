export type LoginRequest = {
  phone: string;
  code: string;
  guestToken?: string;
};

export type UserStatus = 'needs_onboarding' | 'active';
export type UserRole = 'guest' | 'member';

export type LoginResult = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userStatus: UserStatus;
  userRole: UserRole;
};
