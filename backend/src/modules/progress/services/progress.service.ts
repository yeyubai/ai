import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { buildDateRange, getTodayInTimezone, parseDateOnly } from 'src/shared/utils/date.utils';
import { ProgressRangeResponseDto } from '../dto/progress-range-response.dto';
import { WeeklyReportResponseDto } from '../dto/weekly-report-response.dto';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeyState: JourneyStateService,
  ) {}

  getWeekly(userId: bigint): Promise<ProgressRangeResponseDto> {
    return this.getRange(userId, 7);
  }

  getMonthly(userId: bigint): Promise<ProgressRangeResponseDto> {
    return this.getRange(userId, 30);
  }

  async getWeeklyReport(userId: bigint): Promise<WeeklyReportResponseDto> {
    const range = await this.getRange(userId, 7);
    const membership = this.journeyState.getMembershipStatus(userId);
    const latestPoint = [...range.weightTrendPoints].reverse().find((item) => item.weightKg !== null);
    const earliestPoint = range.weightTrendPoints.find((item) => item.weightKg !== null);
    const weightDelta =
      latestPoint && earliestPoint
        ? Number((latestPoint.weightKg! - earliestPoint.weightKg!).toFixed(1))
        : 0;

    return {
      summary: {
        title:
          range.exerciseDays >= 4
            ? '这周你的体重和运动节奏正在对齐'
            : '先把体重记录和运动节奏重新接上',
        body:
          range.exerciseDays > 0 || range.weighInDays > 0
            ? `近 7 天完成 ${range.exerciseDays} 天运动，累计消耗 ${range.burnKcalTotal} kcal，体重变化 ${weightDelta} kg。`
            : '这周先从连续完成体重记录和一次轻运动开始。',
      },
      lockedSections: membership.plan === 'free' ? ['deep_pattern_analysis', 'coach_suggestions'] : [],
      membershipPrompt: {
        show: membership.plan === 'free',
        reason: 'weekly_report_value_moment',
      },
    };
  }

  private async getRange(userId: bigint, days: number): Promise<ProgressRangeResponseDto> {
    const today = getTodayInTimezone();
    const dates = buildDateRange(today, days);
    const dateObjects = dates.map((item) => parseDateOnly(item));
    const [weights, activities] = await Promise.all([
      this.prisma.checkinWeight.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: { gte: dateObjects[0], lte: dateObjects[dateObjects.length - 1] },
        },
        orderBy: [{ checkinDate: 'asc' }, { measuredAt: 'asc' }],
      }),
      this.prisma.checkinActivity.findMany({
        where: {
          userId,
          deletedAt: null,
          checkinDate: { gte: dateObjects[0], lte: dateObjects[dateObjects.length - 1] },
        },
        orderBy: [{ checkinDate: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    const latestWeightByDate = new Map<string, number>();
    weights.forEach((item) => {
      latestWeightByDate.set(item.checkinDate.toISOString().slice(0, 10), Number(item.weightKg));
    });

    const weightTrendPoints = dates.map((date) => ({
      date,
      weightKg: latestWeightByDate.get(date) ?? null,
      isMissing: !latestWeightByDate.has(date),
    }));

    const completedActivityByDate = new Map<string, { count: number; burnKcal: number }>();
    activities
      .filter((item) => item.completed)
      .forEach((item) => {
        const key = item.checkinDate.toISOString().slice(0, 10);
        const current = completedActivityByDate.get(key) ?? { count: 0, burnKcal: 0 };
        current.count += 1;
        current.burnKcal += item.estimatedKcal ?? 0;
        completedActivityByDate.set(key, current);
      });

    const weighInDays = weightTrendPoints.filter((item) => item.weightKg !== null).length;
    const exerciseDays = Array.from(completedActivityByDate.keys()).length;
    const exerciseCompletionRate = Number((exerciseDays / days).toFixed(2));
    const burnKcalTotal = Array.from(completedActivityByDate.values()).reduce(
      (sum, item) => sum + item.burnKcal,
      0,
    );

    return {
      weightTrendPoints,
      exerciseCompletionRate,
      burnKcalTotal,
      exerciseDays,
      weighInDays,
      milestone: {
        current: exerciseDays >= 5 ? '连续 5 天有运动记录' : `连续 ${exerciseDays} 天有运动记录`,
        next:
          weighInDays >= 5 && exerciseDays >= 5
            ? '继续保持体重与运动双核心连续性'
            : '先连续 5 天完成体重或运动记录',
      },
    };
  }
}
