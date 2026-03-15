export class GuestLoginResponseDto {
  token!: string;
  refreshToken!: string;
  expiresIn!: number;
  userStatus!: 'active';
  userRole!: 'guest';
}
