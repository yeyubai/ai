import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProfileRepository } from 'src/modules/profile/repositories/profile.repository';
import { ProfileService } from 'src/modules/profile/services/profile.service';
import { JourneyStateService } from 'src/shared/state/journey-state.service';

type FindUserById = ProfileRepository['findUserById'];
type FindActiveProfileByUserId = ProfileRepository['findActiveProfileByUserId'];
type UpsertProfile = ProfileRepository['upsertProfile'];
type MarkProfileCompleted = ProfileRepository['markProfileCompleted'];

type ProfileRepositoryMock = {
  findUserById: jest.Mock<ReturnType<FindUserById>, Parameters<FindUserById>>;
  findActiveProfileByUserId: jest.Mock<
    ReturnType<FindActiveProfileByUserId>,
    Parameters<FindActiveProfileByUserId>
  >;
  runInTransaction: ProfileRepository['runInTransaction'];
  upsertProfile: jest.Mock<ReturnType<UpsertProfile>, Parameters<UpsertProfile>>;
  markProfileCompleted: jest.Mock<
    ReturnType<MarkProfileCompleted>,
    Parameters<MarkProfileCompleted>
  >;
};

function createProfileRepositoryMock(): ProfileRepositoryMock {
  const runInTransaction: ProfileRepository['runInTransaction'] = async (
    handler,
  ) => handler({} as Prisma.TransactionClient);

  return {
    findUserById: jest.fn<ReturnType<FindUserById>, Parameters<FindUserById>>(),
    findActiveProfileByUserId: jest.fn<
      ReturnType<FindActiveProfileByUserId>,
      Parameters<FindActiveProfileByUserId>
    >(),
    runInTransaction,
    upsertProfile: jest.fn<ReturnType<UpsertProfile>, Parameters<UpsertProfile>>(
      async () => undefined,
    ),
    markProfileCompleted: jest.fn<
      ReturnType<MarkProfileCompleted>,
      Parameters<MarkProfileCompleted>
    >(async () => undefined),
  };
}

describe('ProfileService', () => {
  it('returns empty profile for first-login user', async () => {
    const repository = createProfileRepositoryMock();
    repository.findUserById.mockResolvedValue({
      id: 1n,
      phone: '13800138000',
      profileCompleted: false,
    });
    repository.findActiveProfileByUserId.mockResolvedValue(null);
    const service = new ProfileService(
      repository as unknown as ProfileRepository,
      new JourneyStateService(),
    );

    const profile = await service.getProfile(1n);

    expect(profile.profileCompleted).toBe(false);
    expect(profile.heightCm).toBeNull();
    expect(profile.currentWeightKg).toBeNull();
    expect(profile.targetWeightKg).toBeNull();
  });

  it('throws INVALID_PARAMS when target weight is larger than current weight', async () => {
    const repository = createProfileRepositoryMock();
    repository.findUserById.mockResolvedValue({
      id: 1n,
      phone: '13800138000',
      profileCompleted: false,
    });
    const service = new ProfileService(
      repository as unknown as ProfileRepository,
      new JourneyStateService(),
    );

    await expect(
      service.updateProfile(1n, {
        heightCm: 170,
        currentWeightKg: 80,
        targetWeightKg: 85,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws AUTH_EXPIRED when current user does not exist', async () => {
    const repository = createProfileRepositoryMock();
    repository.findUserById.mockResolvedValue(null);
    const service = new ProfileService(
      repository as unknown as ProfileRepository,
      new JourneyStateService(),
    );

    await expect(service.getProfile(1n)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
