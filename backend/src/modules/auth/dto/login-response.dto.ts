export class LoginResponseDto {
  token!: string;
  refreshToken!: string;
  expiresIn!: number;
  userStatus!: 'needs_onboarding' | 'active';
}
