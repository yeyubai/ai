import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { envConfig } from 'src/shared/config/env.config';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    if (payload.code !== envConfig.authMockCode) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const user = await this.authRepository.upsertUserByPhone(payload.phone);
    if (payload.guestToken) {
      const guestUser = await this.authRepository.findUserByAccessToken(payload.guestToken);
      if (guestUser?.isGuest) {
        await this.authRepository.mergeGuestUserIntoMember(guestUser.id, user.id);
      }
    }

    const token = this.buildToken('atk');
    const refreshToken = this.buildToken('rtk');
    const expiresIn = envConfig.authTokenExpiresInSeconds;

    await this.authRepository.createSession({
      userId: user.id,
      accessToken: token,
      refreshToken,
      expiresAt: this.calculateExpiresAt(expiresIn),
    });

    return {
      token,
      refreshToken,
      expiresIn,
      userStatus: user.profileCompleted ? 'active' : 'needs_onboarding',
      userRole: 'member',
    };
  }

  async createGuestSession(): Promise<LoginResponseDto> {
    const guestPhone = `guest_${Date.now()}_${randomBytes(6).toString('hex')}`;
    const guestUser = await this.authRepository.createGuestUser(guestPhone);
    const token = this.buildToken('atk');
    const refreshToken = this.buildToken('rtk');
    const expiresIn = envConfig.authTokenExpiresInSeconds;

    await this.authRepository.createSession({
      userId: guestUser.id,
      accessToken: token,
      refreshToken,
      expiresAt: this.calculateExpiresAt(expiresIn),
    });

    return {
      token,
      refreshToken,
      expiresIn,
      userStatus: 'active',
      userRole: 'guest',
    };
  }

  async getUserIdByAccessToken(accessToken: string): Promise<bigint | null> {
    const session = await this.authRepository.findValidSessionByAccessToken(accessToken);
    return session?.userId ?? null;
  }

  private buildToken(prefix: 'atk' | 'rtk'): string {
    return `${prefix}_${randomBytes(24).toString('base64url')}`;
  }

  private calculateExpiresAt(expiresInSeconds: number): Date {
    return new Date(Date.now() + expiresInSeconds * 1000);
  }
}
