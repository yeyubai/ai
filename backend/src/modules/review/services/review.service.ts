import { ConflictException, Injectable } from '@nestjs/common';
import type { CheckinActivity } from '@prisma/client';
import { PrismaService } from 'src/shared/db/prisma.service';
import { apiSuccess } from 'src/shared/dto/api-response.dto';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { parseDateOnly, shiftDateString } from 'src/shared/utils/date.utils';
import { ReviewEveningResponseDto } from '../dto/review-evening-response.dto';
import { ReviewSkipResponseDto } from '../dto/review-skip-response.dto';

type EveningReviewContext = {
  hasWeight: boolean;
  activityCompleted: boolean;
  burnKcalTotal: number;
  recoveryMode: boolean;
};

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeyState: JourneyStateService,
  ) {}

  async createEvening(userId: bigint, date: string) {
    const context = await this.loadEveningReviewContext(userId, date);
    this.ensureReviewReady(context);

    const response = this.buildEveningReviewResponse(context);
    this.saveReviewState(userId, date, response);

    if (context.recoveryMode) {
      return apiSuccess(response, {
        code: 'PLAN_FALLBACK_USED',
        message: 'fallback plan is used',
      });
    }

    return response;
  }

  async skip(userId: bigint, date: string, reason: string): Promise<ReviewSkipResponseDto> {
    this.journeyState.completeAction(userId, date, `review-skip:${reason}`);
    return {
      skipped: true,
      reason,
    };
  }

  private async loadEveningReviewContext(
    userId: bigint,
    date: string,
  ): Promise<EveningReviewContext> {
    const targetDate = parseDateOnly(date);
    const [weightRecord, activityRecords, recoveryMode] = await Promise.all([
      this.prisma.checkinWeight.findFirst({
        where: { userId, checkinDate: targetDate, deletedAt: null },
        orderBy: { measuredAt: 'desc' },
      }),
      this.prisma.checkinActivity.findMany({
        where: { userId, checkinDate: targetDate, deletedAt: null, completed: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.isRecoveryMode(userId, date),
    ]);

    return {
      hasWeight: Boolean(weightRecord),
      activityCompleted: activityRecords.length > 0,
      burnKcalTotal: this.sumBurnKcal(activityRecords),
      recoveryMode,
    };
  }

  private ensureReviewReady(context: EveningReviewContext): void {
    if (context.hasWeight || context.activityCompleted) {
      return;
    }

    throw new ConflictException({
      code: 'REVIEW_NOT_READY',
      message: 'REVIEW_NOT_READY',
    });
  }

  private buildEveningReviewResponse(
    context: EveningReviewContext,
  ): ReviewEveningResponseDto {
    const completedCoreActions =
      Number(context.hasWeight) + Number(context.activityCompleted);

    return {
      reviewSummary: {
        score: Math.min(
          96,
          50 + completedCoreActions * 18 + (context.activityCompleted ? 8 : 0),
        ),
        highlights: this.buildHighlights(context),
        gaps: this.buildGaps(context),
      },
      tomorrowPreview: {
        focus: this.buildTomorrowFocus(context),
        maxTasks: context.recoveryMode ? 2 : 3,
      },
      recoveryMode: context.recoveryMode,
      fallbackReason: context.recoveryMode ? 'two_day_dropoff' : null,
      confidence: context.recoveryMode ? 0.7 : 0.9,
    };
  }

  private saveReviewState(
    userId: bigint,
    date: string,
    response: ReviewEveningResponseDto,
  ): void {
    this.journeyState.saveReview(userId, date, {
      ...response,
      completedAt: new Date().toISOString(),
    });
  }

  private async isRecoveryMode(userId: bigint, date: string): Promise<boolean> {
    const previousDates = [shiftDateString(date, -1), shiftDateString(date, -2)];
    const [weightResults, activityResults] = await Promise.all([
      Promise.all(previousDates.map((item) => this.hasWeight(userId, item))),
      Promise.all(previousDates.map((item) => this.hasActivity(userId, item))),
    ]);

    return (
      weightResults.every((value) => value === false) ||
      activityResults.every((value) => value === false)
    );
  }

  private async hasWeight(userId: bigint, date: string): Promise<boolean> {
    const targetDate = parseDateOnly(date);
    const count = await this.prisma.checkinWeight.count({
      where: { userId, checkinDate: targetDate, deletedAt: null },
    });

    return count > 0;
  }

  private async hasActivity(userId: bigint, date: string): Promise<boolean> {
    const targetDate = parseDateOnly(date);
    const count = await this.prisma.checkinActivity.count({
      where: { userId, checkinDate: targetDate, completed: true, deletedAt: null },
    });

    return count > 0;
  }

  private sumBurnKcal(activityRecords: CheckinActivity[]): number {
    return activityRecords.reduce(
      (sum: number, item: CheckinActivity) => sum + (item.estimatedKcal ?? 0),
      0,
    );
  }

  private buildHighlights(input: EveningReviewContext): string[] {
    const highlights: string[] = [];
    if (input.hasWeight) {
      highlights.push('今天完成了晨起体重记录。');
    }
    if (input.activityCompleted) {
      highlights.push(`今天已经完成运动，累计消耗 ${input.burnKcalTotal} kcal。`);
    }

    return highlights.length > 0 ? highlights : ['今天至少完成了一件对减脂有帮助的事。'];
  }

  private buildGaps(input: EveningReviewContext): string[] {
    const gaps: string[] = [];
    if (!input.hasWeight) {
      gaps.push('明早先把体重记录补回来。');
    }
    if (!input.activityCompleted) {
      gaps.push(
        input.recoveryMode
          ? '明天先完成一次 10-15 分钟轻运动。'
          : '明天补上一段 20-30 分钟运动并记录消耗。',
      );
    }

    return gaps.length > 0 ? gaps : ['明天继续保持今天的节奏就很好。'];
  }

  private buildTomorrowFocus(input: EveningReviewContext): string[] {
    const focus: string[] = [];
    if (!input.hasWeight) {
      focus.push('明早先称重一次');
    } else {
      focus.push('继续保持晨起体重记录');
    }

    if (!input.activityCompleted) {
      focus.push(input.recoveryMode ? '安排 10 分钟轻运动' : '安排 20 分钟运动并记录消耗');
    } else {
      focus.push('延续今天的运动节奏');
    }

    return focus;
  }
}
