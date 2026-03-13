import {
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { CheckinsRepository } from 'src/modules/checkins/repositories/checkins.repository';
import { CheckinsService } from 'src/modules/checkins/services/checkins.service';
import { PrismaService } from 'src/shared/db/prisma.service';

function getTodayInShanghai(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

function createCheckinsRepositoryMock(): jest.Mocked<
  Pick<
    CheckinsRepository,
    | 'countWeightByDate'
    | 'countWeightByRecentHour'
    | 'findWeightByMeasuredAt'
    | 'findWeightByIdempotencyKey'
    | 'createWeight'
    | 'countMealByRecentHour'
    | 'findMealDuplicate'
    | 'findMealByIdempotencyKey'
    | 'createMeal'
    | 'countActivityByRecentHour'
    | 'findActivityDuplicate'
    | 'findActivityByIdempotencyKey'
    | 'createActivity'
    | 'countSleepByRecentHour'
    | 'findSleepDuplicate'
    | 'findSleepByIdempotencyKey'
    | 'createSleep'
  >
> {
  return {
    countWeightByDate: jest.fn().mockResolvedValue(0),
    countWeightByRecentHour: jest.fn().mockResolvedValue(0),
    findWeightByMeasuredAt: jest.fn().mockResolvedValue(null),
    findWeightByIdempotencyKey: jest.fn().mockResolvedValue(null),
    createWeight: jest.fn().mockResolvedValue({
      id: 1n,
      checkinDate: new Date(),
      isBackfill: false,
      createdAt: new Date(),
    }),
    countMealByRecentHour: jest.fn().mockResolvedValue(0),
    findMealDuplicate: jest.fn().mockResolvedValue(null),
    findMealByIdempotencyKey: jest.fn().mockResolvedValue(null),
    createMeal: jest.fn().mockResolvedValue({
      id: 2n,
      checkinDate: new Date(),
      isBackfill: false,
      createdAt: new Date(),
    }),
    countActivityByRecentHour: jest.fn().mockResolvedValue(0),
    findActivityDuplicate: jest.fn().mockResolvedValue(null),
    findActivityByIdempotencyKey: jest.fn().mockResolvedValue(null),
    createActivity: jest.fn().mockResolvedValue({
      id: 3n,
      checkinDate: new Date(),
      isBackfill: false,
      createdAt: new Date(),
    }),
    countSleepByRecentHour: jest.fn().mockResolvedValue(0),
    findSleepDuplicate: jest.fn().mockResolvedValue(null),
    findSleepByIdempotencyKey: jest.fn().mockResolvedValue(null),
    createSleep: jest.fn().mockResolvedValue({
      id: 4n,
      checkinDate: new Date(),
      isBackfill: false,
      createdAt: new Date(),
    }),
  };
}

describe('CheckinsService', () => {
  it('throws CHECKIN_LIMIT_REACHED when weight entries exceed daily limit', async () => {
    const repository = createCheckinsRepositoryMock();
    repository.countWeightByDate.mockResolvedValue(3);
    const service = new CheckinsService(
      repository as unknown as CheckinsRepository,
      {} as PrismaService,
    );

    await expect(
      service.createWeightCheckin(1n, {
        checkinDate: getTodayInShanghai(),
        measuredAt: new Date().toISOString(),
        weightKg: 72.5,
        source: 'manual',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws INVALID_PARAMS when wakeAt is not later than sleepAt', async () => {
    const repository = createCheckinsRepositoryMock();
    const service = new CheckinsService(
      repository as unknown as CheckinsRepository,
      {} as PrismaService,
    );
    const now = new Date().toISOString();

    await expect(
      service.createSleepCheckin(1n, {
        checkinDate: getTodayInShanghai(),
        sleepAt: now,
        wakeAt: now,
        durationMin: 30,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns existing meal checkin when idempotency key has been used', async () => {
    const repository = createCheckinsRepositoryMock();
    repository.findMealByIdempotencyKey.mockResolvedValue({
      id: 55n,
      checkinDate: new Date(`${getTodayInShanghai()}T00:00:00.000Z`),
      isBackfill: false,
      createdAt: new Date(),
    });
    const service = new CheckinsService(
      repository as unknown as CheckinsRepository,
      {} as PrismaService,
    );

    const result = await service.createMealCheckin(
      1n,
      {
        checkinDate: getTodayInShanghai(),
        mealType: 'lunch',
        description: 'chicken salad',
      },
      'idem-1',
    );

    expect(result.checkinId).toBe('m_55');
    expect(result.checkinType).toBe('meal');
    expect(repository.createMeal).not.toHaveBeenCalled();
  });

  it('throws CHECKIN_RATE_LIMIT when activity submissions exceed hourly limit', async () => {
    const repository = createCheckinsRepositoryMock();
    repository.countActivityByRecentHour.mockResolvedValue(60);
    const service = new CheckinsService(
      repository as unknown as CheckinsRepository,
      {} as PrismaService,
    );

    await expect(
      service.createActivityCheckin(1n, {
        checkinDate: getTodayInShanghai(),
        completed: true,
        activityType: 'walk',
        durationMin: 30,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('creates weight checkin successfully', async () => {
    const repository = createCheckinsRepositoryMock();
    repository.createWeight.mockResolvedValue({
      id: 9n,
      checkinDate: new Date(`${getTodayInShanghai()}T00:00:00.000Z`),
      isBackfill: false,
      createdAt: new Date(),
    });
    const service = new CheckinsService(
      repository as unknown as CheckinsRepository,
      {} as PrismaService,
    );

    const result = await service.createWeightCheckin(1n, {
      checkinDate: getTodayInShanghai(),
      measuredAt: new Date().toISOString(),
      weightKg: 71.1,
      source: 'manual',
    });

    expect(result.checkinType).toBe('weight');
    expect(result.checkinId).toBe('w_9');
  });
});
