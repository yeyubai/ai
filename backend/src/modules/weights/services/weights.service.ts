import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import {
  formatDateOnly,
  getTodayInTimezone,
  parseDateOnly,
  shiftDateString,
} from 'src/shared/utils/date.utils';
import { CreateWeightEntryRequestDto } from '../dto/create-weight-entry-request.dto';
import { QueryWeightEntriesRequestDto } from '../dto/query-weight-entries-request.dto';
import { QueryWeightRangeRequestDto } from '../dto/query-weight-range-request.dto';
import { UpdateWeightEntryRequestDto } from '../dto/update-weight-entry-request.dto';
import {
  WeightEntryDetailDto,
  WeightMetricRangeDto,
} from '../dto/weight-entry-detail.dto';
import { WeightEntryListResponseDto } from '../dto/weight-entry-list-response.dto';
import { WeightEntryDto } from '../dto/weight-entry.dto';
import { WeightStatsResponseDto } from '../dto/weight-stats-response.dto';
import { WeightTodaySummaryResponseDto } from '../dto/weight-today-summary-response.dto';
import { WeightTrendResponseDto } from '../dto/weight-trend-response.dto';

type StoredWeightEntry = {
  id: bigint;
  entryDate: Date;
  measuredAt: Date;
  weightKg: unknown;
  bodyFatPct: unknown;
  note: string | null;
  source: string;
};

@Injectable()
export class WeightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodaySummary(userId: bigint): Promise<WeightTodaySummaryResponseDto> {
    const today = getTodayInTimezone();
    const [entries, goal, profile, recordDays] = await Promise.all([
      this.prisma.weightEntry.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ entryDate: 'desc' }, { measuredAt: 'desc' }],
        take: 2,
      }),
      this.prisma.weightGoal.findFirst({
        where: { userId, deletedAt: null },
        select: {
          startWeightKg: true,
          targetWeightKg: true,
          targetDate: true,
          weightUnit: true,
        },
      }),
      this.prisma.userProfile.findFirst({
        where: { userId, deletedAt: null },
        select: { heightCm: true },
      }),
      this.prisma.weightEntry.findMany({
        where: { userId, deletedAt: null },
        select: { entryDate: true },
        distinct: ['entryDate'],
      }),
    ]);

    const latestEntry = entries[0] ?? null;
    const previousEntry = entries[1] ?? null;
    const todayEntry = await this.prisma.weightEntry.findFirst({
      where: {
        userId,
        deletedAt: null,
        entryDate: parseDateOnly(today),
      },
      orderBy: { measuredAt: 'desc' },
    });

    const latestWeight = latestEntry ? Number(latestEntry.weightKg) : null;
    const previousWeight = previousEntry ? Number(previousEntry.weightKg) : null;
    const startWeight = goal ? Number(goal.startWeightKg) : latestWeight;

    return {
      latestEntry: latestEntry ? this.toEntryDto(latestEntry, previousEntry) : null,
      todayEntry: todayEntry ? this.toEntryDto(todayEntry, previousEntry) : null,
      goal: goal
        ? {
            startWeightKg: Number(goal.startWeightKg),
            targetWeightKg: Number(goal.targetWeightKg),
            targetDate: goal.targetDate ? formatDateOnly(goal.targetDate) : null,
            weightUnit: goal.weightUnit as 'kg' | 'lb',
          }
        : null,
      deltaFromStart:
        latestWeight === null || startWeight === null
          ? null
          : this.roundWeight(latestWeight - startWeight),
      deltaFromPrevious:
        latestWeight === null || previousWeight === null
          ? null
          : this.roundWeight(latestWeight - previousWeight),
      bmi:
        latestWeight === null || !profile?.heightCm
          ? null
          : this.roundOne(latestWeight / ((profile.heightCm / 100) * (profile.heightCm / 100))),
      bodyFatPct:
        latestEntry?.bodyFatPct !== null && latestEntry?.bodyFatPct !== undefined
          ? this.roundOne(Number(latestEntry.bodyFatPct))
          : latestWeight !== null && profile?.heightCm
            ? this.estimateBodyFatFromBmi(
                this.roundOne(
                  latestWeight / ((profile.heightCm / 100) * (profile.heightCm / 100)),
                ),
              )
            : null,
      recordDays: recordDays.length,
    };
  }

  async getStats(
    userId: bigint,
    query: QueryWeightRangeRequestDto,
  ): Promise<WeightStatsResponseDto> {
    const range = query.range ?? '30d';
    const entries = await this.getEntriesForRange(userId, range);
    const weights = entries.map((entry) => Number(entry.weightKg));

    return {
      range,
      recordDays: entries.length,
      netChangeKg:
        entries.length >= 2
          ? this.roundWeight(weights[weights.length - 1] - weights[0])
          : null,
      highestWeightKg: weights.length > 0 ? this.roundWeight(Math.max(...weights)) : null,
      lowestWeightKg: weights.length > 0 ? this.roundWeight(Math.min(...weights)) : null,
      startWeightKg: weights[0] ?? null,
      latestWeightKg: weights[weights.length - 1] ?? null,
    };
  }

  async getTrend(
    userId: bigint,
    query: QueryWeightRangeRequestDto,
  ): Promise<WeightTrendResponseDto> {
    const range = query.range ?? '30d';
    const entries = await this.getEntriesForRange(userId, range);

    return {
      range,
      points: entries.map((entry) => ({
        date: formatDateOnly(entry.entryDate),
        weightKg: this.roundWeight(Number(entry.weightKg)),
      })),
    };
  }

  async listEntries(
    userId: bigint,
    query: QueryWeightEntriesRequestDto,
  ): Promise<WeightEntryListResponseDto> {
    const where = {
      userId,
      deletedAt: null,
      ...(query.dateFrom || query.dateTo
        ? {
            entryDate: {
              ...(query.dateFrom ? { gte: parseDateOnly(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: parseDateOnly(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const rows = await this.prisma.weightEntry.findMany({
      where,
      orderBy: [{ entryDate: 'desc' }, { measuredAt: 'desc' }],
      take: 120,
    });

    const mapped = rows.map((row, index) => this.toEntryDto(row, rows[index + 1] ?? null));
    const groups = mapped.reduce<WeightEntryListResponseDto['groups']>((accumulator, item) => {
      const existing = accumulator.find((group) => group.date === item.entryDate);
      if (existing) {
        existing.entries.push(item);
        return accumulator;
      }

      accumulator.push({
        date: item.entryDate,
        entries: [item],
      });
      return accumulator;
    }, []);

    return {
      groups,
      nextCursor: null,
    };
  }

  async getEntry(userId: bigint, entryId: string): Promise<WeightEntryDetailDto> {
    const targetId = this.parseEntryId(entryId);
    const row = await this.prisma.weightEntry.findFirst({
      where: {
        id: targetId,
        userId,
        deletedAt: null,
      },
    });
    if (!row) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    const [profile, previous] = await Promise.all([
      this.prisma.userProfile.findFirst({
        where: { userId, deletedAt: null },
        select: { heightCm: true },
      }),
      this.prisma.weightEntry.findFirst({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { entryDate: { lt: row.entryDate } },
            {
              entryDate: row.entryDate,
              measuredAt: { lt: row.measuredAt },
            },
          ],
        },
        orderBy: [{ entryDate: 'desc' }, { measuredAt: 'desc' }],
      }),
    ]);

    const weightKg = Number(row.weightKg);
    const bmi =
      profile?.heightCm
        ? this.roundOne(weightKg / ((profile.heightCm / 100) * (profile.heightCm / 100)))
        : null;
    const currentBodyFat =
      row.bodyFatPct !== null && row.bodyFatPct !== undefined
        ? this.roundOne(Number(row.bodyFatPct))
        : bmi === null
          ? null
          : this.estimateBodyFatFromBmi(bmi);
    const previousBmi =
      previous && profile?.heightCm
        ? this.roundOne(
            Number(previous.weightKg) /
              ((profile.heightCm / 100) * (profile.heightCm / 100)),
          )
        : null;
    const previousBodyFat =
      previous?.bodyFatPct !== null && previous?.bodyFatPct !== undefined
        ? this.roundOne(Number(previous.bodyFatPct))
        : previousBmi === null
          ? null
          : this.estimateBodyFatFromBmi(previousBmi);
    const weightRange = this.buildWeightRange(profile?.heightCm ?? null, weightKg);
    const bodyFatRange = this.buildBodyFatRange(
      currentBodyFat,
      !(row.bodyFatPct !== null && row.bodyFatPct !== undefined),
    );
    const bmiRange = this.buildBmiRange(bmi);

    return {
      id: row.id.toString(),
      entryDate: formatDateOnly(row.entryDate),
      measuredAt: row.measuredAt.toISOString(),
      previousMeasuredAt: previous ? previous.measuredAt.toISOString() : null,
      syncStatus: 'placeholder_unsynced',
      weightKg: this.roundWeight(weightKg) ?? weightKg,
      deltaFromPreviousKg:
        previous ? this.roundWeight(weightKg - Number(previous.weightKg)) : null,
      deltaFromPreviousBodyFatPct:
        previousBodyFat !== null && currentBodyFat !== null
          ? this.roundOne(currentBodyFat - previousBodyFat)
          : null,
      weightLevel: weightRange.level,
      bmi,
      bmiLevel: bmiRange.level,
      estimatedBodyFatPct: currentBodyFat,
      bodyFatLevel: bodyFatRange.level,
      note: row.note,
      ranges: {
        weight: weightRange,
        bodyFat: bodyFatRange,
        bmi: bmiRange,
      },
    };
  }

  async createEntry(
    userId: bigint,
    payload: CreateWeightEntryRequestDto,
  ): Promise<WeightEntryDto> {
    const measuredAt = payload.measuredAt ? new Date(payload.measuredAt) : new Date();
    const entryDate = payload.entryDate
      ? parseDateOnly(payload.entryDate)
      : parseDateOnly(measuredAt.toISOString().slice(0, 10));

    const created = await this.prisma.weightEntry.create({
      data: {
        userId,
        entryDate,
        measuredAt,
        weightKg: payload.weightKg,
        bodyFatPct: payload.bodyFatPct,
        note: payload.note?.trim() || null,
        source: 'manual',
      },
    });

    const previous = await this.prisma.weightEntry.findFirst({
      where: {
        userId,
        deletedAt: null,
        id: { not: created.id },
      },
      orderBy: [{ entryDate: 'desc' }, { measuredAt: 'desc' }],
    });

    return this.toEntryDto(created, previous);
  }

  async updateEntry(
    userId: bigint,
    entryId: string,
    payload: UpdateWeightEntryRequestDto,
  ): Promise<WeightEntryDto> {
    const targetId = this.parseEntryId(entryId);
    const existing = await this.prisma.weightEntry.findFirst({
      where: {
        id: targetId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    const updated = await this.prisma.weightEntry.update({
      where: { id: targetId },
      data: {
        entryDate: parseDateOnly(payload.entryDate),
        measuredAt: new Date(payload.measuredAt),
        weightKg: payload.weightKg,
        bodyFatPct: payload.bodyFatPct ?? null,
        note: payload.note?.trim() || null,
      },
    });

    const previous = await this.prisma.weightEntry.findFirst({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { entryDate: { lt: updated.entryDate } },
          {
            entryDate: updated.entryDate,
            measuredAt: { lt: updated.measuredAt },
          },
        ],
      },
      orderBy: [{ entryDate: 'desc' }, { measuredAt: 'desc' }],
    });

    return this.toEntryDto(updated, previous);
  }

  async deleteEntry(userId: bigint, entryId: string): Promise<{ deleted: true }> {
    const targetId = this.parseEntryId(entryId);
    const existing = await this.prisma.weightEntry.findFirst({
      where: {
        id: targetId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    await this.prisma.weightEntry.update({
      where: { id: targetId },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }

  private async getEntriesForRange(
    userId: bigint,
    range: '7d' | '30d' | '90d' | 'all',
  ): Promise<StoredWeightEntry[]> {
    const today = getTodayInTimezone();
    const dateFrom =
      range === 'all'
        ? undefined
        : parseDateOnly(shiftDateString(today, -(this.rangeToDays(range) - 1)));

    const rows = await this.prisma.weightEntry.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(dateFrom ? { entryDate: { gte: dateFrom } } : {}),
      },
      orderBy: [{ entryDate: 'asc' }, { measuredAt: 'asc' }],
    });

    const latestPerDay = new Map<string, StoredWeightEntry>();
    for (const row of rows) {
      latestPerDay.set(formatDateOnly(row.entryDate), row);
    }

    return Array.from(latestPerDay.values()).sort((left, right) => {
      if (left.entryDate < right.entryDate) {
        return -1;
      }
      if (left.entryDate > right.entryDate) {
        return 1;
      }
      return left.measuredAt < right.measuredAt ? -1 : 1;
    });
  }

  private rangeToDays(range: '7d' | '30d' | '90d' | 'all'): number {
    if (range === '7d') {
      return 7;
    }
    if (range === '90d') {
      return 90;
    }
    return 30;
  }

  private toEntryDto(
    entry: StoredWeightEntry,
    previous: StoredWeightEntry | null,
  ): WeightEntryDto {
    const currentWeight = Number(entry.weightKg);
    const previousWeight = previous ? Number(previous.weightKg) : null;

    return {
      id: entry.id.toString(),
      entryDate: formatDateOnly(entry.entryDate),
      measuredAt: entry.measuredAt.toISOString(),
      syncStatus: 'placeholder_unsynced',
      weightKg: this.roundWeight(currentWeight) ?? currentWeight,
      bodyFatPct:
        entry.bodyFatPct !== null && entry.bodyFatPct !== undefined
          ? this.roundOne(Number(entry.bodyFatPct))
          : null,
      note: entry.note,
      source: 'manual',
      deltaFromPreviousKg:
        previousWeight === null ? null : this.roundWeight(currentWeight - previousWeight),
    };
  }

  private roundOne(value: number): number {
    return Number(value.toFixed(1));
  }

  private roundWeight(value: number): number | null {
    if (!Number.isFinite(value)) {
      return null;
    }

    return Number(value.toFixed(2));
  }

  private parseEntryId(entryId: string): bigint {
    try {
      return BigInt(entryId);
    } catch {
      throw new NotFoundException('INVALID_PARAMS');
    }
  }

  private estimateBodyFatFromBmi(bmi: number): number {
    return this.roundOne(Math.max(5, Math.min(45, bmi * 0.76)));
  }

  private buildBmiRange(value: number | null): WeightMetricRangeDto {
    const thresholds = [18.5, 24, 28];
    return {
      metric: 'bmi',
      unit: '',
      value,
      level:
        value === null
          ? null
          : value < thresholds[0]
            ? '偏低'
            : value < thresholds[1]
              ? '正常'
              : value < thresholds[2]
                ? '偏高'
                : '超高',
      estimated: false,
      thresholds,
      segments: [
        { label: '偏低', min: null, max: thresholds[0], color: 'sky' },
        { label: '正常', min: thresholds[0], max: thresholds[1], color: 'green' },
        { label: '偏高', min: thresholds[1], max: thresholds[2], color: 'amber' },
        { label: '超高', min: thresholds[2], max: null, color: 'rose' },
      ],
    };
  }

  private buildBodyFatRange(value: number | null, estimated: boolean): WeightMetricRangeDto {
    const thresholds = [10, 20, 25];
    return {
      metric: 'bodyFat',
      unit: '%',
      value,
      level:
        value === null
          ? null
          : value < thresholds[0]
            ? '偏低'
            : value < thresholds[1]
              ? '正常'
              : value < thresholds[2]
                ? '偏高'
                : '超高',
      estimated,
      thresholds,
      segments: [
        { label: '偏低', min: null, max: thresholds[0], color: 'sky' },
        { label: '正常', min: thresholds[0], max: thresholds[1], color: 'green' },
        { label: '偏高', min: thresholds[1], max: thresholds[2], color: 'amber' },
        { label: '超高', min: thresholds[2], max: null, color: 'rose' },
      ],
    };
  }

  private buildWeightRange(heightCm: number | null, value: number): WeightMetricRangeDto {
    if (!heightCm) {
      return {
        metric: 'weight',
        unit: '公斤',
        value,
        level: null,
        estimated: false,
        thresholds: [],
        segments: [],
      };
    }

    const factor = (heightCm / 100) * (heightCm / 100);
    const thresholds = [
      this.roundOne(18.5 * factor),
      this.roundOne(24 * factor),
      this.roundOne(28 * factor),
    ];

    return {
      metric: 'weight',
      unit: '公斤',
      value,
      level:
        value < thresholds[0]
          ? '偏瘦'
          : value < thresholds[1]
            ? '正常'
            : value < thresholds[2]
              ? '超重'
              : '肥胖',
      estimated: false,
      thresholds,
      segments: [
        { label: '偏瘦', min: null, max: thresholds[0], color: 'sky' },
        { label: '正常', min: thresholds[0], max: thresholds[1], color: 'green' },
        { label: '超重', min: thresholds[1], max: thresholds[2], color: 'amber' },
        { label: '肥胖', min: thresholds[2], max: null, color: 'rose' },
      ],
    };
  }
}
