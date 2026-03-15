import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { WeightsService } from 'src/modules/weights/services/weights.service';

type WeightEntryDelegate = {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};

type WeightGoalDelegate = {
  findFirst: jest.Mock;
};

type UserProfileDelegate = {
  findFirst: jest.Mock;
};

type PrismaMock = {
  weightEntry: WeightEntryDelegate;
  weightGoal: WeightGoalDelegate;
  userProfile: UserProfileDelegate;
};

function createPrismaMock(): PrismaMock {
  return {
    weightEntry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    weightGoal: {
      findFirst: jest.fn(),
    },
    userProfile: {
      findFirst: jest.fn(),
    },
  };
}

describe('WeightsService', () => {
  it('aggregates stats by latest entry of each day', async () => {
    const prisma = createPrismaMock();
    prisma.weightEntry.findMany.mockResolvedValue([
      {
        id: 1n,
        entryDate: new Date('2026-03-01T00:00:00+08:00'),
        measuredAt: new Date('2026-03-01T08:00:00+08:00'),
        weightKg: 70,
        bodyFatPct: null,
        note: null,
        source: 'manual',
      },
      {
        id: 2n,
        entryDate: new Date('2026-03-01T00:00:00+08:00'),
        measuredAt: new Date('2026-03-01T20:00:00+08:00'),
        weightKg: 69.4,
        bodyFatPct: null,
        note: null,
        source: 'manual',
      },
      {
        id: 3n,
        entryDate: new Date('2026-03-02T00:00:00+08:00'),
        measuredAt: new Date('2026-03-02T08:00:00+08:00'),
        weightKg: 68.8,
        bodyFatPct: null,
        note: null,
        source: 'manual',
      },
    ]);

    const service = new WeightsService(prisma as unknown as PrismaService);
    const result = await service.getStats(1n, { range: '7d' });

    expect(result.recordDays).toBe(2);
    expect(result.startWeightKg).toBe(69.4);
    expect(result.latestWeightKg).toBe(68.8);
    expect(result.netChangeKg).toBe(-0.6);
  });

  it('builds summary with bmi and deltas', async () => {
    const prisma = createPrismaMock();
    prisma.weightEntry.findMany
      .mockResolvedValueOnce([
        {
          id: 3n,
          entryDate: new Date('2026-03-13T00:00:00+08:00'),
          measuredAt: new Date('2026-03-13T08:00:00+08:00'),
          weightKg: 68.8,
          bodyFatPct: 17.4,
          note: null,
          source: 'manual',
        },
        {
          id: 2n,
          entryDate: new Date('2026-03-12T00:00:00+08:00'),
          measuredAt: new Date('2026-03-12T08:00:00+08:00'),
          weightKg: 69.4,
          bodyFatPct: null,
          note: null,
          source: 'manual',
        },
      ])
      .mockResolvedValueOnce([
        { entryDate: new Date('2026-03-13T00:00:00+08:00') },
        { entryDate: new Date('2026-03-12T00:00:00+08:00') },
      ]);
    prisma.weightEntry.findFirst.mockResolvedValue({
      id: 3n,
      entryDate: new Date('2026-03-13T00:00:00+08:00'),
      measuredAt: new Date('2026-03-13T08:00:00+08:00'),
      weightKg: 68.8,
      bodyFatPct: 17.4,
      note: null,
      source: 'manual',
    });
    prisma.weightGoal.findFirst.mockResolvedValue({
      startWeightKg: 76.4,
      targetWeightKg: 60,
      targetDate: null,
      weightUnit: 'kg',
    });
    prisma.userProfile.findFirst.mockResolvedValue({
      heightCm: 170,
    });

    const service = new WeightsService(prisma as unknown as PrismaService);
    const result = await service.getTodaySummary(1n);

    expect(result.recordDays).toBe(2);
    expect(result.deltaFromStart).toBe(-7.6);
    expect(result.deltaFromPrevious).toBe(-0.6);
    expect(result.bmi).toBe(23.8);
    expect(result.bodyFatPct).toBe(17.4);
  });

  it('builds entry detail with levels and ranges', async () => {
    const prisma = createPrismaMock();
    prisma.weightEntry.findFirst
      .mockResolvedValueOnce({
        id: 2n,
        entryDate: new Date('2026-03-13T00:00:00+08:00'),
        measuredAt: new Date('2026-03-13T20:56:00+08:00'),
        weightKg: 72.8,
        bodyFatPct: null,
        note: 'after dinner',
        source: 'manual',
      })
      .mockResolvedValueOnce({
        id: 1n,
        entryDate: new Date('2025-12-25T00:00:00+08:00'),
        measuredAt: new Date('2025-12-25T20:18:00+08:00'),
        weightKg: 68.75,
        bodyFatPct: null,
        note: null,
        source: 'manual',
      });
    prisma.userProfile.findFirst.mockResolvedValue({
      heightCm: 170,
    });

    const service = new WeightsService(prisma as unknown as PrismaService);
    const result = await service.getEntry(1n, '2');

    expect(result.weightLevel).toBe('超重');
    expect(result.bmiLevel).toBe('偏高');
    expect(result.bodyFatLevel).toBe('正常');
    expect(result.syncStatus).toBe('placeholder_unsynced');
    expect(result.ranges.weight.segments).toHaveLength(4);
    expect(result.previousMeasuredAt).toContain('2025-12-25');
  });

  it('soft deletes an existing entry', async () => {
    const prisma = createPrismaMock();
    prisma.weightEntry.findFirst.mockResolvedValue({ id: 3n });
    prisma.weightEntry.update.mockResolvedValue({});

    const service = new WeightsService(prisma as unknown as PrismaService);

    await expect(service.deleteEntry(1n, '3')).resolves.toEqual({ deleted: true });
    expect(prisma.weightEntry.update).toHaveBeenCalledTimes(1);
  });

  it('throws when deleting a missing entry', async () => {
    const prisma = createPrismaMock();
    prisma.weightEntry.findFirst.mockResolvedValue(null);

    const service = new WeightsService(prisma as unknown as PrismaService);

    await expect(service.deleteEntry(1n, '99')).rejects.toBeInstanceOf(NotFoundException);
  });
});
