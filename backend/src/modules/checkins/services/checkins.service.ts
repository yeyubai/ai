import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CheckinCreatedResponseDto, CheckinType } from '../dto/checkin-created-response.dto';
import { CreateActivityCheckinRequestDto } from '../dto/create-activity-checkin-request.dto';
import { CreateMealCheckinRequestDto } from '../dto/create-meal-checkin-request.dto';
import { CreateSleepCheckinRequestDto } from '../dto/create-sleep-checkin-request.dto';
import { CreateWeightCheckinRequestDto } from '../dto/create-weight-checkin-request.dto';
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

@Injectable()
export class CheckinsService {
  constructor(private readonly checkinsRepository: CheckinsRepository) {}

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
    if (dayCount >= 3) {
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
      payload.activityType,
      payload.durationMin,
      payload.steps,
      payload.estimatedKcal,
    );
    if (duplicate) {
      this.throwDuplicate();
    }

    const created = await this.checkinsRepository.createActivity({
      userId,
      checkinDate: context.checkinDate,
      activityType: payload.activityType,
      durationMin: payload.durationMin,
      steps: payload.steps,
      estimatedKcal: payload.estimatedKcal,
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

  private buildBaseContext(
    checkinDateString: string,
    isBackfillInput?: boolean,
  ): BaseCheckinContext {
    const checkinDate = this.parseDateOnly(checkinDateString);
    const isBackfill = isBackfillInput ?? false;
    this.ensureCheckinDateWindow(checkinDateString, isBackfill);
    return { checkinDate, isBackfill };
  }

  private ensureCheckinDateWindow(
    checkinDateString: string,
    isBackfill: boolean,
  ): void {
    const today = this.getTodayInShanghai();
    const earliestAllowed = this.shiftDateString(today, -7);

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
        {
          code: 'CHECKIN_RATE_LIMIT',
          message: 'CHECKIN_RATE_LIMIT',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private buildRateLimitCutoff(): Date {
    return new Date(Date.now() - 60 * 60 * 1000);
  }

  private throwDuplicate(): never {
    throw new ConflictException({
      code: 'DUPLICATE_CHECKIN',
      message: 'DUPLICATE_CHECKIN',
    });
  }

  private throwLimitReached(): never {
    throw new ConflictException({
      code: 'CHECKIN_LIMIT_REACHED',
      message: 'CHECKIN_LIMIT_REACHED',
    });
  }

  private buildResponse(
    checkinType: CheckinType,
    checkin: PersistedCheckin,
  ): CheckinCreatedResponseDto {
    const prefixByType: Record<CheckinType, string> = {
      weight: 'w',
      meal: 'm',
      activity: 'a',
      sleep: 's',
    };

    return {
      checkinId: `${prefixByType[checkinType]}_${checkin.id.toString()}`,
      checkinType,
      checkinDate: this.formatDateOnly(checkin.checkinDate),
      isBackfill: checkin.isBackfill,
      createdAt: checkin.createdAt,
    };
  }

  private async findWeightByIdempotencyKey(
    userId: bigint,
    idempotencyKey?: string,
  ): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findWeightByIdempotencyKey(userId, normalized);
  }

  private async findMealByIdempotencyKey(
    userId: bigint,
    idempotencyKey?: string,
  ): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findMealByIdempotencyKey(userId, normalized);
  }

  private async findActivityByIdempotencyKey(
    userId: bigint,
    idempotencyKey?: string,
  ): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findActivityByIdempotencyKey(userId, normalized);
  }

  private async findSleepByIdempotencyKey(
    userId: bigint,
    idempotencyKey?: string,
  ): Promise<PersistedCheckin | null> {
    const normalized = this.normalizeIdempotencyKey(idempotencyKey);
    if (!normalized) {
      return null;
    }

    return this.checkinsRepository.findSleepByIdempotencyKey(userId, normalized);
  }

  private normalizeIdempotencyKey(raw?: string): string | undefined {
    if (!raw) {
      return undefined;
    }

    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private parseDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private formatDateOnly(value: Date): string {
    return this.formatDateWithTimezone(value, 'UTC');
  }

  private getTodayInShanghai(): string {
    return this.formatDateWithTimezone(new Date(), 'Asia/Shanghai');
  }

  private shiftDateString(dateString: string, days: number): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const shifted = new Date(Date.UTC(year, month - 1, day));
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return this.formatDateWithTimezone(shifted, 'UTC');
  }

  private formatDateWithTimezone(date: Date, timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    return `${year}-${month}-${day}`;
  }
}
