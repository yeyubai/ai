import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

type PersistedCheckin = {
  id: bigint;
  checkinDate: Date;
  isBackfill: boolean;
  createdAt: Date;
};

type CreateWeightPayload = {
  userId: bigint;
  checkinDate: Date;
  measuredAt: Date;
  weightKg: number;
  source: 'manual' | 'smart_scale';
  isBackfill: boolean;
  idempotencyKey?: string;
};

type CreateMealPayload = {
  userId: bigint;
  checkinDate: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  estimatedKcal?: number;
  imageUrl?: string;
  isBackfill: boolean;
  idempotencyKey?: string;
};

type CreateActivityPayload = {
  userId: bigint;
  checkinDate: Date;
  activityType: string;
  durationMin: number;
  steps?: number;
  estimatedKcal?: number;
  isBackfill: boolean;
  idempotencyKey?: string;
};

type CreateSleepPayload = {
  userId: bigint;
  checkinDate: Date;
  sleepAt: Date;
  wakeAt: Date;
  durationMin: number;
  isBackfill: boolean;
  idempotencyKey?: string;
};

@Injectable()
export class CheckinsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countWeightByDate(userId: bigint, checkinDate: Date): Promise<number> {
    return this.prisma.checkinWeight.count({
      where: {
        userId,
        checkinDate,
        deletedAt: null,
      },
    });
  }

  async countWeightByRecentHour(userId: bigint, cutoff: Date): Promise<number> {
    return this.prisma.checkinWeight.count({
      where: {
        userId,
        createdAt: {
          gte: cutoff,
        },
        deletedAt: null,
      },
    });
  }

  async findWeightByMeasuredAt(
    userId: bigint,
    measuredAt: Date,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinWeight.findFirst({
      where: {
        userId,
        measuredAt,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async findWeightByIdempotencyKey(
    userId: bigint,
    idempotencyKey: string,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinWeight.findFirst({
      where: {
        userId,
        idempotencyKey,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async createWeight(payload: CreateWeightPayload): Promise<PersistedCheckin> {
    return this.prisma.checkinWeight.create({
      data: payload,
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async countMealByRecentHour(userId: bigint, cutoff: Date): Promise<number> {
    return this.prisma.checkinMeal.count({
      where: {
        userId,
        createdAt: {
          gte: cutoff,
        },
        deletedAt: null,
      },
    });
  }

  async findMealDuplicate(
    userId: bigint,
    checkinDate: Date,
    mealType: string,
    description: string,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinMeal.findFirst({
      where: {
        userId,
        checkinDate,
        mealType,
        description,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async findMealByIdempotencyKey(
    userId: bigint,
    idempotencyKey: string,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinMeal.findFirst({
      where: {
        userId,
        idempotencyKey,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async createMeal(payload: CreateMealPayload): Promise<PersistedCheckin> {
    return this.prisma.checkinMeal.create({
      data: payload,
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async countActivityByRecentHour(userId: bigint, cutoff: Date): Promise<number> {
    return this.prisma.checkinActivity.count({
      where: {
        userId,
        createdAt: {
          gte: cutoff,
        },
        deletedAt: null,
      },
    });
  }

  async findActivityDuplicate(
    userId: bigint,
    checkinDate: Date,
    activityType: string,
    durationMin: number,
    steps?: number,
    estimatedKcal?: number,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinActivity.findFirst({
      where: {
        userId,
        checkinDate,
        activityType,
        durationMin,
        steps: steps ?? null,
        estimatedKcal: estimatedKcal ?? null,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async findActivityByIdempotencyKey(
    userId: bigint,
    idempotencyKey: string,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinActivity.findFirst({
      where: {
        userId,
        idempotencyKey,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async createActivity(payload: CreateActivityPayload): Promise<PersistedCheckin> {
    return this.prisma.checkinActivity.create({
      data: payload,
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async countSleepByRecentHour(userId: bigint, cutoff: Date): Promise<number> {
    return this.prisma.checkinSleep.count({
      where: {
        userId,
        createdAt: {
          gte: cutoff,
        },
        deletedAt: null,
      },
    });
  }

  async findSleepDuplicate(
    userId: bigint,
    sleepAt: Date,
    wakeAt: Date,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinSleep.findFirst({
      where: {
        userId,
        sleepAt,
        wakeAt,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async findSleepByIdempotencyKey(
    userId: bigint,
    idempotencyKey: string,
  ): Promise<PersistedCheckin | null> {
    return this.prisma.checkinSleep.findFirst({
      where: {
        userId,
        idempotencyKey,
        deletedAt: null,
      },
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }

  async createSleep(payload: CreateSleepPayload): Promise<PersistedCheckin> {
    return this.prisma.checkinSleep.create({
      data: payload,
      select: {
        id: true,
        checkinDate: true,
        isBackfill: true,
        createdAt: true,
      },
    });
  }
}
