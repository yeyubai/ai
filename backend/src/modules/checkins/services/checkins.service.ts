import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import {
  formatDateOnly,
  getTodayInTimezone,
  parseDateOnly,
  shiftDateString,
} from 'src/shared/utils/date.utils';
import {
  CheckinHistoryResponseDto,
  TodayCheckinsResponseDto,
} from '../dto/checkin-feed-response.dto';
import { CheckinCreatedResponseDto, CheckinType } from '../dto/checkin-created-response.dto';
import { CreateActivityCheckinRequestDto } from '../dto/create-activity-checkin-request.dto';
import { CreateMealCheckinRequestDto } from '../dto/create-meal-checkin-request.dto';
import { CreateSleepCheckinRequestDto } from '../dto/create-sleep-checkin-request.dto';
import { CreateWeightCheckinRequestDto } from '../dto/create-weight-checkin-request.dto';
import { QueryCheckinHistoryRequestDto } from '../dto/query-checkin-history-request.dto';
import { CheckinsRepository } from '../repositories/checkins.repository';

type PersistedCheckin = {
  id: bigint;
  checkinDate: Date;
  isBackfill: boolean;
  createdAt: Date;
};

type BaseCheckinContext = {
  checkinDate: Date;
  isBackfill: boolean;
};

type NormalizedActivityPayload = {
  completed: boolean;
  activityType: string;
  durationMin: number;
  steps?: number;
  estimatedKcal?: number;
};

type WeightRecord = {
  id: bigint;
  checkinDate: Date;
  weightKg: { toString(): string };
  isBackfill: boolean;
  createdAt: Date;
};

type MealRecord = {
  id: bigint;
  checkinDate: Date;
  mealType: string;
  description: string;
  isBackfill: boolean;
  createdAt: Date;
};

type ActivityRecord = {
  id: bigint;
  checkinDate: Date;
  completed: boolean;
  durationMin: number;
  estimatedKcal: number | null;
  isBackfill: boolean;
  createdAt: Date;
};

type SleepRecord = {
  id: bigint;
  checkinDate: Date;
  durationMin: number;
  isBackfill: boolean;
  createdAt: Date;
};

@Injectable()
export class CheckinsService {
  constructor(
    private readonly checkinsRepository: CheckinsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createWeightCheckin(
    userId: bigint,
    payload: CreateWeightCheckinRequestDto,
    idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    const context = this.buildBaseContext(payload.checkinDate, payload.isBackfill);
    await this.ensureRateLimit(
      await this.checkinsRepository.countWeightByRecentHour(
        userId,
        this.buildRateLimitCutoff(),
      ),
    );

    const deduped = await this.findWeightByIdempotencyKey(userId, idempotencyKey);
    if (deduped) {
      return this.buildResponse('weight', deduped);
    }

    const duplicate = await this.checkinsRepository.findWeightByMeasuredAt(
      userId,
      new Date(payload.measuredAt),
    );
    if (duplicate) {
      this.throwDuplicate();
    }

    const dayCount = await this.checkinsRepository.countWeightByDate(
      userId,
      context.checkinDate,
    );
    if (dayCount >= 1) {
      this.throwLimitReached();
    }

    const created = await this.checkinsRepository.createWeight({
      userId,
      checkinDate: context.checkinDate,
      measuredAt: new Date(payload.measuredAt),
      weightKg: payload.weightKg,
      source: payload.source,
      isBackfill: context.isBackfill,
      idempotencyKey: this.normalizeIdempotencyKey(idempotencyKey),
    });

    return this.buildResponse('weight', created);
  }

  async createMealCheckin(
    userId: bigint,
    payload: CreateMealCheckinRequestDto,
    idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    const context = this.buildBaseContext(payload.checkinDate, payload.isBackfill);
    await this.ensureRateLimit(
      await this.checkinsRepository.countMealByRecentHour(
        userId,
        this.buildRateLimitCutoff(),
      ),
    );

    const deduped = await this.findMealByIdempotencyKey(userId, idempotencyKey);
    if (deduped) {
      return this.buildResponse('meal', deduped);
    }

    const duplicate = await this.checkinsRepository.findMealDuplicate(
      userId,
      context.checkinDate,
      payload.mealType,
      payload.description,
    );
    if (duplicate) {
      this.throwDuplicate();
    }

    const created = await this.checkinsRepository.createMeal({
      userId,
      checkinDate: context.checkinDate,
      mealType: payload.mealType,
      description: payload.description,
      estimatedKcal: payload.estimatedKcal,
      imageUrl: payload.imageUrl,
      isBackfill: context.isBackfill,
      idempotencyKey: this.normalizeIdempotencyKey(idempotencyKey),
    });

    return this.buildResponse('meal', created);
  }

  async createActivityCheckin(
    userId: bigint,
    payload: CreateActivityCheckinRequestDto,
    idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    const context = this.buildBaseContext(payload.checkinDate, payload.isBackfill);
    const normalized = this.normalizeActivityPayload(payload);
    await this.ensureRateLimit(
      await this.checkinsRepository.countActivityByRecentHour(
        userId,
        this.buildRateLimitCutoff(),
      ),
    );

    const deduped = await this.findActivityByIdempotencyKey(userId, idempotencyKey);
    if (deduped) {
      return this.buildResponse('activity', deduped);
    }

    const duplicate = await this.checkinsRepository.findActivityDuplicate(
      userId,
      context.checkinDate,
      normalized.completed,
      normalized.activityType,
      normalized.durationMin,
      normalized.steps,
      normalized.estimatedKcal,
    );
    if (duplicate) {
      this.throwDuplicate();
    }

    const created = await this.checkinsRepository.createActivity({
      userId,
      checkinDate: context.checkinDate,
      completed: normalized.completed,
      activityType: normalized.activityType,
      durationMin: normalized.durationMin,
      steps: normalized.steps,
      estimatedKcal: normalized.estimatedKcal,
      isBackfill: context.isBackfill,
      idempotencyKey: this.normalizeIdempotencyKey(idempotencyKey),
    });

    return this.buildResponse('activity', created);
  }

  async createSleepCheckin(
    userId: bigint,
    payload: CreateSleepCheckinRequestDto,
    idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    const context = this.buildBaseContext(payload.checkinDate, payload.isBackfill);
    const sleepAt = new Date(payload.sleepAt);
    const wakeAt = new Date(payload.wakeAt);
    if (wakeAt <= sleepAt) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    await this.ensureRateLimit(
      await this.checkinsRepository.countSleepByRecentHour(
        userId,
        this.buildRateLimitCutoff(),
      ),
    );

    const deduped = await this.findSleepByIdempotencyKey(userId, idempotencyKey);
    if (deduped) {
      return this.buildResponse('sleep', deduped);
    }

    const duplicate = await this.checkinsRepository.findSleepDuplicate(
      userId,
      sleepAt,
      wakeAt,
    );
    if (duplicate) {
      this.throwDuplicate();
    }

    const created = await this.checkinsRepository.createSleep({
      userId,
      checkinDate: context.checkinDate,
      sleepAt,
      wakeAt,
      durationMin: payload.durationMin,
      isBackfill: context.isBackfill,
      idempotencyKey: this.normalizeIdempotencyKey(idempotencyKey),
    });

    return this.buildResponse('sleep', created);
  }

  async getTodayCheckins(userId: bigint, date?: string): Promise<TodayCheckinsResponseDto> {
    const targetDate = parseDateOnly(date ?? getTodayInTimezone());

    const [weight, meals, activities, sleep] = await Promise.all([
      this.prisma.checkinWeight.findMany({
        where: { userId, deletedAt: null, checkinDate: targetDate },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkinMeal.findMany({
        where: { userId, deletedAt: null, checkinDate: targetDate },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkinActivity.findMany({
        where: { userId, deletedAt: null, checkinDate: targetDate },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkinSleep.findMany({
        where: { userId, deletedAt: null, checkinDate: targetDate },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const items = [
      ...weight.map((item: WeightRecord) => ({
        checkinId: `w_${item.id.toString()}`,
        type: 'weight' as const,
        checkinDate: formatDateOnly(item.checkinDate),
        displayValue: `${item.weightKg.toString()} kg`,
        isBackfill: item.isBackfill,
        createdAt: item.createdAt.toISOString(),
      })),
      ...meals.map((item: MealRecord) => ({
        checkinId: `m_${item.id.toString()}`,
        type: 'meal' as const,
        checkinDate: formatDateOnly(item.checkinDate),
        displayValue: `${item.mealType} · ${item.description}`,
        isBackfill: item.isBackfill,
        createdAt: item.createdAt.toISOString(),
      })),
      ...activities.map((item: ActivityRecord) => ({
        checkinId: `a_${item.id.toString()}`,
        type: 'activity' as const,
        checkinDate: formatDateOnly(item.checkinDate),
        displayValue: this.formatActivityDisplayValue(item.completed, item.durationMin, item.estimatedKcal),
        isBackfill: item.isBackfill,
        createdAt: item.createdAt.toISOString(),
      })),
      ...sleep.map((item: SleepRecord) => ({
        checkinId: `s_${item.id.toString()}`,
        type: 'sleep' as const,
        checkinDate: formatDateOnly(item.checkinDate),
        displayValue: `${item.durationMin} 分钟睡眠`,
        isBackfill: item.isBackfill,
        createdAt: item.createdAt.toISOString(),
      })),
    ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return { items };
  }

  async getHistory(
    userId: bigint,
    query: QueryCheckinHistoryRequestDto,
  ): Promise<CheckinHistoryResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const dateFrom = parseDateOnly(
      query.dateFrom ?? shiftDateString(getTodayInTimezone(), -6),
    );
    const dateTo = parseDateOnly(query.dateTo ?? getTodayInTimezone());

    if (dateFrom > dateTo) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const type = query.type ?? 'weight';
    const skip = (page - 1) * pageSize;

    if (type === 'weight') {
      const [list, total] = await Promise.all([
        this.prisma.checkinWeight.findMany({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
          orderBy: [{ checkinDate: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: pageSize,
        }),
        this.prisma.checkinWeight.count({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
        }),
      ]);

      return {
        list: list.map((item: WeightRecord) => ({
          checkinId: `w_${item.id.toString()}`,
          type: 'weight',
          checkinDate: formatDateOnly(item.checkinDate),
          displayValue: `${item.weightKg.toString()} kg`,
          isBackfill: item.isBackfill,
          createdAt: item.createdAt.toISOString(),
        })),
        total,
      };
    }

    if (type === 'meal') {
      const [list, total] = await Promise.all([
        this.prisma.checkinMeal.findMany({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
          orderBy: [{ checkinDate: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: pageSize,
        }),
        this.prisma.checkinMeal.count({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
        }),
      ]);

      return {
        list: list.map((item: MealRecord) => ({
          checkinId: `m_${item.id.toString()}`,
          type: 'meal',
          checkinDate: formatDateOnly(item.checkinDate),
          displayValue: `${item.mealType} · ${item.description}`,
          isBackfill: item.isBackfill,
          createdAt: item.createdAt.toISOString(),
        })),
        total,
      };
    }

    if (type === 'activity') {
      const [list, total] = await Promise.all([
        this.prisma.checkinActivity.findMany({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
          orderBy: [{ checkinDate: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: pageSize,
        }),
        this.prisma.checkinActivity.count({
          where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
        }),
      ]);

      return {
        list: list.map((item: ActivityRecord) => ({
          checkinId: `a_${item.id.toString()}`,
          type: 'activity',
          checkinDate: formatDateOnly(item.checkinDate),
          displayValue: this.formatActivityDisplayValue(item.completed, item.durationMin, item.estimatedKcal),
          isBackfill: item.isBackfill,
          createdAt: item.createdAt.toISOString(),
        })),
        total,
      };
    }

    const [list, total] = await Promise.all([
      this.prisma.checkinSleep.findMany({
        where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
        orderBy: [{ checkinDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.checkinSleep.count({
        where: { userId, deletedAt: null, checkinDate: { gte: dateFrom, lte: dateTo } },
      }),
    ]);

    return {
      list: list.map((item: SleepRecord) => ({
        checkinId: `s_${item.id.toString()}`,
        type: 'sleep',
        checkinDate: formatDateOnly(item.checkinDate),
        displayValue: `${item.durationMin} 分钟睡眠`,
        isBackfill: item.isBackfill,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  private buildBaseContext(
    checkinDateString: string,
    isBackfillInput?: boolean,
  ): BaseCheckinContext {
    const checkinDate = parseDateOnly(checkinDateString);
    const isBackfill = isBackfillInput ?? false;
    this.ensureCheckinDateWindow(checkinDateString, isBackfill);
    return { checkinDate, isBackfill };
  }

  private normalizeActivityPayload(
    payload: CreateActivityCheckinRequestDto,
  ): NormalizedActivityPayload {
    if (payload.completed) {
      if (payload.durationMin <= 0) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      return {
        completed: true,
        activityType: payload.activityType?.trim() || 'exercise',
        durationMin: payload.durationMin,
        steps: payload.steps,
        estimatedKcal: payload.estimatedKcal ?? 0,
      };
    }

    return {
      completed: false,
      activityType: payload.activityType?.trim() || 'not_completed',
      durationMin: 0,
      steps: undefined,
      estimatedKcal: 0,
    };
  }

  private ensureCheckinDateWindow(
    checkinDateString: string,
    isBackfill: boolean,
  ): void {
    const today = getTodayInTimezone();
    const earliestAllowed = shiftDateString(today, -7);

    if (checkinDateString < earliestAllowed || checkinDateString > today) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    if (!isBackfill && checkinDateString !== today) {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private ensureRateLimit(countInPastHour: number): void {
    if (countInPastHour >= 60) {
      throw new HttpException(
        { code: 'CHECKIN_RATE_LIMIT', message: 'CHECKIN_RATE_LIMIT' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private buildRateLimitCutoff(): Date {
    return new Date(Date.now() - 60 * 60 * 1000);
  }

  private throwDuplicate(): never {
    throw new ConflictException({ code: 'DUPLICATE_CHECKIN', message: 'DUPLICATE_CHECKIN' });
  }

  private throwLimitReached(): never {
    throw new ConflictException({ code: 'CHECKIN_LIMIT_REACHED', message: 'CHECKIN_LIMIT_REACHED' });
  }

  private buildResponse(checkinType: CheckinType, checkin: PersistedCheckin): CheckinCreatedResponseDto {
    const prefixByType: Record<CheckinType, string> = {
      weight: 'w',
      meal: 'm',
      activity: 'a',
      sleep: 's',
    };

    return {
      checkinId: `${prefixByType[checkinType]}_${checkin.id.toString()}`,
      checkinType,
      checkinDate: formatDateOnly(checkin.checkinDate),
      isBackfill: checkin.isBackfill,
      createdAt: checkin.createdAt,
    };
  }

  private async findWeightByIdempotencyKey(userId: bigint, idempotencyKey?: string): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findWeightByIdempotencyKey(userId, normalized);
  }

  private async findMealByIdempotencyKey(userId: bigint, idempotencyKey?: string): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findMealByIdempotencyKey(userId, normalized);
  }

  private async findActivityByIdempotencyKey(userId: bigint, idempotencyKey?: string): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findActivityByIdempotencyKey(userId, normalized);
  }

  private async findSleepByIdempotencyKey(userId: bigint, idempotencyKey?: string): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findSleepByIdempotencyKey(userId, normalized);
  }

  private normalizeIdempotencyKey(idempotencyKey?: string): string | undefined {
    const trimmed = idempotencyKey?.trim();
    return trimmed ? trimmed.slice(0, 64) : undefined;
  }

  private formatActivityDisplayValue(
    completed: boolean,
    durationMin: number,
    estimatedKcal: number | null,
  ): string {
    if (!completed) {
      return '今日暂未完成运动';
    }

    return `已完成 ${durationMin} 分钟 · ${estimatedKcal ?? 0} kcal`;
  }

}
