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

    await this.authRepository.upsertUserByPhone(payload.phone);

    return {
      token: this.buildToken('atk'),
      refreshToken: this.buildToken('rtk'),
      expiresIn: envConfig.authTokenExpiresInSeconds,
    };
  }

  private buildToken(prefix: 'atk' | 'rtk'): string {
    return `${prefix}_${randomBytes(24).toString('base64url')}`;
  }
}
