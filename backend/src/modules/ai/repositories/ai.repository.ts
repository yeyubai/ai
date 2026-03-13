import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type CreateAiPlanRecordPayload = {
  userId: bigint;
  planDate: Date;
  refreshSeq: number;
  source: 'model' | 'fallback';
  payloadJson: Prisma.InputJsonValue;
};

type CreateAiReviewRecordPayload = {
  userId: bigint;
  reviewDate: Date;
  source: 'model' | 'fallback';
  payloadJson: Prisma.InputJsonValue;
};

export type AiPlanRecord = {
  id: bigint;
  planDate: Date;
  refreshSeq: number;
  payloadJson: Prisma.JsonValue;
  source: string;
  createdAt: Date;
};

export type AiReviewRecord = {
  id: bigint;
  reviewDate: Date;
  payloadJson: Prisma.JsonValue;
  source: string;
  createdAt: Date;
};

type CheckinCompletion = {
  weightCount: number;
  mealCount: number;
  activityCount: number;
  sleepCount: number;
};

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestPlanByDate(
    userId: bigint,
    planDate: Date,
  ): Promise<AiPlanRecord | null> {
    return this.prisma.aiPlan.findFirst({
      where: {
        userId,
        planDate,
        deletedAt: null,
      },
      orderBy: [{ refreshSeq: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        planDate: true,
        refreshSeq: true,
        payloadJson: true,
        source: true,
        createdAt: true,
      },
    });
  }

  async countPlansByDate(userId: bigint, planDate: Date): Promise<number> {
    return this.prisma.aiPlan.count({
      where: {
        userId,
        planDate,
        deletedAt: null,
      },
    });
  }

  async createPlan(payload: CreateAiPlanRecordPayload): Promise<AiPlanRecord> {
    return this.prisma.aiPlan.create({
      data: {
        userId: payload.userId,
        planDate: payload.planDate,
        refreshSeq: payload.refreshSeq,
        source: payload.source,
        payloadJson: payload.payloadJson,
      },
      select: {
        id: true,
        planDate: true,
        refreshSeq: true,
        payloadJson: true,
        source: true,
        createdAt: true,
      },
    });
  }

  async countReviewsByDate(userId: bigint, reviewDate: Date): Promise<number> {
    return this.prisma.aiReview.count({
      where: {
        userId,
        reviewDate,
        deletedAt: null,
      },
    });
  }

  async createReview(payload: CreateAiReviewRecordPayload): Promise<AiReviewRecord> {
    return this.prisma.aiReview.create({
      data: {
        userId: payload.userId,
        reviewDate: payload.reviewDate,
        source: payload.source,
        payloadJson: payload.payloadJson,
      },
      select: {
        id: true,
        reviewDate: true,
        payloadJson: true,
        source: true,
        createdAt: true,
      },
    });
  }

  async countActiveCheckinDays(
    userId: bigint,
    range: DateRange,
  ): Promise<number> {
    const [weightDates, mealDates, activityDates, sleepDates] = await Promise.all([
      this.prisma.checkinWeight.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        select: {
          checkinDate: true,
        },
        distinct: ['checkinDate'],
      }),
      this.prisma.checkinMeal.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        select: {
          checkinDate: true,
        },
        distinct: ['checkinDate'],
      }),
      this.prisma.checkinActivity.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        select: {
          checkinDate: true,
        },
        distinct: ['checkinDate'],
      }),
      this.prisma.checkinSleep.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        select: {
          checkinDate: true,
        },
        distinct: ['checkinDate'],
      }),
    ]);

    const days = new Set<string>();
    for (const item of [
      ...weightDates,
      ...mealDates,
      ...activityDates,
      ...sleepDates,
    ]) {
      days.add(item.checkinDate.toISOString().slice(0, 10));
    }

    return days.size;
  }

  async findUserProfile(userId: bigint): Promise<{
    currentWeightKg: Prisma.Decimal;
    targetWeightKg: Prisma.Decimal;
  } | null> {
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        currentWeightKg: true,
        targetWeightKg: true,
      },
    });
  }

  async findLatestWeight(
    userId: bigint,
    upToDate: Date,
  ): Promise<{ weightKg: Prisma.Decimal } | null> {
    return this.prisma.checkinWeight.findFirst({
      where: {
        userId,
        deletedAt: null,
        checkinDate: {
          lte: upToDate,
        },
      },
      orderBy: [{ checkinDate: 'desc' }, { measuredAt: 'desc' }, { id: 'desc' }],
      select: {
        weightKg: true,
      },
    });
  }

  async countCheckinCompletionByDate(
    userId: bigint,
    checkinDate: Date,
  ): Promise<CheckinCompletion> {
    const [weightCount, mealCount, activityCount, sleepCount] = await Promise.all([
      this.prisma.checkinWeight.count({
        where: {
          userId,
          checkinDate,
          deletedAt: null,
        },
      }),
      this.prisma.checkinMeal.count({
        where: {
          userId,
          checkinDate,
          deletedAt: null,
        },
      }),
      this.prisma.checkinActivity.count({
        where: {
          userId,
          checkinDate,
          deletedAt: null,
        },
      }),
      this.prisma.checkinSleep.count({
        where: {
          userId,
          checkinDate,
          deletedAt: null,
        },
      }),
    ]);

    return {
      weightCount,
      mealCount,
      activityCount,
      sleepCount,
    };
  }
}
