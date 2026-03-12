import { BadRequestException } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { envConfig } from 'src/shared/config/env.config';

type UpsertUserByPhone = AuthRepository['upsertUserByPhone'];

function createAuthRepositoryMock(): jest.Mocked<
  Pick<AuthRepository, 'upsertUserByPhone'>
> {
  return {
    upsertUserByPhone: jest.fn<
      ReturnType<UpsertUserByPhone>,
      Parameters<UpsertUserByPhone>
    >().mockResolvedValue(undefined),
  };
}

describe('AuthService', () => {
  it('throws INVALID_PARAMS when sms code is invalid', async () => {
    const authRepository = createAuthRepositoryMock();
    const service = new AuthService(authRepository as unknown as AuthRepository);

    await expect(
      service.login({ phone: '13800138000', code: '000000' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns access token + refresh token for valid login', async () => {
    const authRepository = createAuthRepositoryMock();
    const service = new AuthService(authRepository as unknown as AuthRepository);

    const result = await service.login({
      phone: '13800138000',
      code: envConfig.authMockCode,
    });

    expect(result.expiresIn).toBe(envConfig.authTokenExpiresInSeconds);
    expect(result.token.startsWith('atk_')).toBe(true);
    expect(result.refreshToken.startsWith('rtk_')).toBe(true);
  });
});
