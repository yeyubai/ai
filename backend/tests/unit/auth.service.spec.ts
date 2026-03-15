import { BadRequestException } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { envConfig } from 'src/shared/config/env.config';

type UpsertUserByPhone = AuthRepository['upsertUserByPhone'];
type CreateGuestUser = AuthRepository['createGuestUser'];
type CreateSession = AuthRepository['createSession'];
type FindValidSessionByAccessToken = AuthRepository['findValidSessionByAccessToken'];
type FindUserByAccessToken = AuthRepository['findUserByAccessToken'];
type MergeGuestUserIntoMember = AuthRepository['mergeGuestUserIntoMember'];

function createAuthRepositoryMock(): jest.Mocked<
  Pick<
    AuthRepository,
    | 'upsertUserByPhone'
    | 'createGuestUser'
    | 'createSession'
    | 'findValidSessionByAccessToken'
    | 'findUserByAccessToken'
    | 'mergeGuestUserIntoMember'
  >
> {
  return {
    upsertUserByPhone: jest.fn<
      ReturnType<UpsertUserByPhone>,
      Parameters<UpsertUserByPhone>
    >().mockResolvedValue({
      id: 1n,
      phone: '13800138000',
      isGuest: false,
      profileCompleted: false,
    }),
    createGuestUser: jest.fn<
      ReturnType<CreateGuestUser>,
      Parameters<CreateGuestUser>
    >().mockResolvedValue({
      id: 3n,
      phone: 'guest_xxx',
      isGuest: true,
      profileCompleted: true,
    }),
    createSession: jest.fn<
      ReturnType<CreateSession>,
      Parameters<CreateSession>
    >().mockResolvedValue(undefined),
    findValidSessionByAccessToken: jest.fn<
      ReturnType<FindValidSessionByAccessToken>,
      Parameters<FindValidSessionByAccessToken>
    >().mockResolvedValue(null),
    findUserByAccessToken: jest.fn<
      ReturnType<FindUserByAccessToken>,
      Parameters<FindUserByAccessToken>
    >().mockResolvedValue(null),
    mergeGuestUserIntoMember: jest.fn<
      ReturnType<MergeGuestUserIntoMember>,
      Parameters<MergeGuestUserIntoMember>
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
    expect(result.userRole).toBe('member');
    expect(authRepository.createSession).toHaveBeenCalledTimes(1);
  });

  it('merges guest data on login when guest token is present', async () => {
    const authRepository = createAuthRepositoryMock();
    authRepository.findUserByAccessToken.mockResolvedValue({
      id: 9n,
      phone: 'guest_token_owner',
      isGuest: true,
      profileCompleted: true,
    });
    const service = new AuthService(authRepository as unknown as AuthRepository);

    await service.login({
      phone: '13800138000',
      code: envConfig.authMockCode,
      guestToken: 'atk_guest',
    });

    expect(authRepository.mergeGuestUserIntoMember).toHaveBeenCalledWith(9n, 1n);
  });

  it('creates a guest session', async () => {
    const authRepository = createAuthRepositoryMock();
    const service = new AuthService(authRepository as unknown as AuthRepository);

    const result = await service.createGuestSession();

    expect(result.userRole).toBe('guest');
    expect(result.userStatus).toBe('active');
    expect(authRepository.createGuestUser).toHaveBeenCalledTimes(1);
    expect(authRepository.createSession).toHaveBeenCalledTimes(1);
  });

  it('returns userId when access token is valid', async () => {
    const authRepository = createAuthRepositoryMock();
    authRepository.findValidSessionByAccessToken.mockResolvedValue({
      userId: 2n,
      expiresAt: new Date(Date.now() + 10_000),
    });
    const service = new AuthService(authRepository as unknown as AuthRepository);

    const userId = await service.getUserIdByAccessToken('atk_token');

    expect(userId).toBe(2n);
  });
});
