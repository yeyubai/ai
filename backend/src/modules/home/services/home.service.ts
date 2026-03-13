import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { apiSuccess } from 'src/shared/dto/api-response.dto';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { buildDateRange, getTodayInTimezone, parseDateOnly, shiftDateString } from 'src/shared/utils/date.utils';
import { CompleteHomeActionResponseDto } from '../dto/complete-home-action-response.dto';
import { HomeTodayResponseDto } from '../dto/home-today-response.dto';

type ActivityTargets = {
  targetDurationMin: number;
  targetBurnKcal: number;
};

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeyState: JourneyStateService,
  ) {}

  async getToday(userId: bigint) {
    const today = getTodayInTimezone();
    const todayDate = parseDateOnly(today);
    const extras = this.journeyState.getProfileExtras(userId);
    const activityTargets = this.getActivityTargets(extras.activityBaseline);
    const [profile, review, membership, weightStatus, activityStatus] = await Promise.all([
      this.prisma.userProfile.findFirst({ where: { userId, deletedAt: null } }),
      Promise.resolve(this.journeyState.getReview(userId, today)),
      Promise.resolve(this.journeyState.getMembershipStatus(userId)),
      this.getWeightStatus(userId, today),
      this.getActivityStatus(userId, todayDate, activityTargets),
    ]);

    const previousDates = [shiftDateString(today, -1), shiftDateString(today, -2)];
    const [weightMissingTwoDays, activityMissingTwoDays] = await Promise.all([
      this.missedWeightForPreviousDays(userId, previousDates),
      this.missedActivityForPreviousDays(userId, previousDates),
    ]);

    const recoveryMode = weightMissingTwoDays || activityMissingTwoDays;
    const reviewDone = review !== null;
    const dailyMission: HomeTodayResponseDto['dailyMission'] = [
      {
        actionId: 'weight_checkin',
        title: recoveryMode ? '先完成晨起体重记录' : '完成晨起体重记录',
        type: 'checkin',
        status: weightStatus.weighedToday ? 'done' : 'todo',
        recommendedAt: '07:00',
      },
      {
        actionId: 'activity_complete',
        title: recoveryMode
          ? `完成 ${Math.max(15, Math.round(activityTargets.targetDurationMin * 0.5))} 分钟轻运动并记录消耗`
          : `完成今天的 ${activityTargets.targetDurationMin} 分钟运动并记录消耗`,
        type: 'behavior',
        status: activityStatus.completedToday ? 'done' : 'todo',
        recommendedAt: '19:00',
      },
      {
        actionId: 'evening_review',
        title: reviewDone ? '今晚 AI 调整已完成' : '晚上做 1 分钟 AI 调整',
        type: 'review',
        status: reviewDone ? 'done' : 'todo',
        recommendedAt: '21:00',
      },
    ];

    const nextAction =
      dailyMission.find((item) => item.status === 'todo') ?? dailyMission[dailyMission.length - 1];
    const completionDone = dailyMission.filter((item) => item.status === 'done').length;
    const riskFlags = this.buildRiskFlags({
      hasProfile: Boolean(profile),
      weighedToday: weightStatus.weighedToday,
      completedToday: activityStatus.completedToday,
      recoveryMode,
    });

    const response: HomeTodayResponseDto = {
      date: today,
      dailyMission,
      completion: {
        done: completionDone,
        total: dailyMission.length,
        rate: Number((completionDone / dailyMission.length).toFixed(2)),
      },
      weightStatus: {
        ...weightStatus,
        targetWeightKg: profile ? Number(profile.targetWeightKg) : null,
      },
      activityStatus,
      nextAction: {
        actionId: nextAction.actionId,
        title: this.getNextActionTitle(nextAction.actionId, activityTargets.targetDurationMin),
        cta: this.getNextActionCta(nextAction.actionId),
      },
      followUp: reviewDone
        ? {
            type: 'trend',
            title: '今天已经完成，去看看这周体重和运动变化。',
            cta: '看看这周变化',
          }
        : {
            type: 'review',
            title: '完成今天动作后，晚上做 1 分钟 AI 调整。',
            cta: '去做今晚复盘',
          },
      membershipState: {
        plan: membership.plan,
        entitlements: Object.entries(membership.entitlements)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
      },
      riskFlags,
      recoveryMode,
      fallbackReason: recoveryMode ? 'insufficient_recent_logs' : null,
    };

    if (recoveryMode) {
      return apiSuccess(response, {
        code: 'PLAN_FALLBACK_USED',
        message: 'fallback plan is used',
      });
    }

    return response;
  }

  async completeAction(
    userId: bigint,
    actionId: string,
    completedAt: string,
  ): Promise<CompleteHomeActionResponseDto> {
    const date = completedAt.slice(0, 10);
    this.journeyState.completeAction(userId, date, actionId);

    return {
      actionId,
      status: 'done',
      refreshHome: true,
    };
  }

  private async getWeightStatus(userId: bigint, today: string) {
    const todayDate = parseDateOnly(today);
    const [latestWeight, todayWeight, weeklyChangeKg] = await Promise.all([
      this.prisma.checkinWeight.findFirst({
        where: { userId, deletedAt: null },
        orderBy: [{ checkinDate: 'desc' }, { measuredAt: 'desc' }],
      }),
      this.prisma.checkinWeight.findFirst({
        where: { userId, checkinDate: todayDate, deletedAt: null },
        orderBy: { measuredAt: 'desc' },
      }),
      this.getWeeklyWeightChange(userId, today),
    ]);

    return {
      latestWeightKg: latestWeight ? Number(latestWeight.weightKg) : null,
      weighedToday: Boolean(todayWeight),
      weeklyChangeKg,
    };
  }

  private async getActivityStatus(
    userId: bigint,
    todayDate: Date,
    activityTargets: ActivityTargets,
  ): Promise<HomeTodayResponseDto['activityStatus']> {
    const [latestTodayActivity, exerciseDays7d] = await Promise.all([
      this.prisma.checkinActivity.findFirst({
        where: { userId, checkinDate: todayDate, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      this.countExerciseDays(userId),
    ]);

    return {
      completedToday: latestTodayActivity?.completed ?? false,
      durationMin: latestTodayActivity?.completed ? latestTodayActivity.durationMin : 0,
      estimatedKcal: latestTodayActivity?.completed ? latestTodayActivity.estimatedKcal ?? 0 : 0,
      targetDurationMin: activityTargets.targetDurationMin,
      targetBurnKcal: activityTargets.targetBurnKcal,
      exerciseDays7d,
    };
  }

  private async getWeeklyWeightChange(userId: bigint, today: string): Promise<number> {
    const dates = buildDateRange(today, 7).map((item) => parseDateOnly(item));
    const weights = await this.prisma.checkinWeight.findMany({
      where: {
        userId,
        deletedAt: null,
        checkinDate: { gte: dates[0], lte: dates[dates.length - 1] },
      },
      orderBy: [{ checkinDate: 'asc' }, { measuredAt: 'asc' }],
    });

    const first = weights[0];
    const last = weights[weights.length - 1];
    if (!first || !last) {
      return 0;
    }

    return Number((Number(last.weightKg) - Number(first.weightKg)).toFixed(1));
  }

  private async countExerciseDays(userId: bigint): Promise<number> {
    const today = getTodayInTimezone();
    const dates = buildDateRange(today, 7).map((item) => parseDateOnly(item));
    const items = await this.prisma.checkinActivity.findMany({
      where: {
        userId,
        deletedAt: null,
        completed: true,
        checkinDate: { gte: dates[0], lte: dates[dates.length - 1] },
      },
      select: {
        checkinDate: true,
      },
      distinct: ['checkinDate'],
    });

    return items.length;
  }

  private async missedWeightForPreviousDays(userId: bigint, dates: string[]): Promise<boolean> {
    const results = await Promise.all(
      dates.map((date) =>
        this.prisma.checkinWeight.count({
          where: { userId, checkinDate: parseDateOnly(date), deletedAt: null },
        }),
      ),
    );

    return results.every((count) => count === 0);
  }

  private async missedActivityForPreviousDays(userId: bigint, dates: string[]): Promise<boolean> {
    const results = await Promise.all(
      dates.map((date) =>
        this.prisma.checkinActivity.count({
          where: {
            userId,
            checkinDate: parseDateOnly(date),
            completed: true,
            deletedAt: null,
          },
        }),
      ),
    );

    return results.every((count) => count === 0);
  }

  private buildRiskFlags(input: {
    hasProfile: boolean;
    weighedToday: boolean;
    completedToday: boolean;
    recoveryMode: boolean;
  }): string[] {
    const flags: string[] = [];
    if (!input.hasProfile) {
      flags.push('profile_incomplete');
    }
    if (!input.weighedToday) {
      flags.push('weight_pending');
    }
    if (!input.completedToday) {
      flags.push('activity_pending');
    }
    if (input.recoveryMode) {
      flags.push('restart_mode');
    }
    return flags;
  }

  private getActivityTargets(activityBaseline: string | null): ActivityTargets {
    switch (activityBaseline) {
      case 'medium':
        return { targetDurationMin: 40, targetBurnKcal: 320 };
      case 'high':
        return { targetDurationMin: 50, targetBurnKcal: 420 };
      default:
        return { targetDurationMin: 30, targetBurnKcal: 220 };
    }
  }

  private getNextActionTitle(actionId: string, targetDurationMin: number): string {
    switch (actionId) {
      case 'weight_checkin':
        return '先完成今天的体重记录';
      case 'activity_complete':
        return `去完成今天的 ${targetDurationMin} 分钟运动动作`;
      case 'evening_review':
      default:
        return '晚上做 1 分钟 AI 调整';
    }
  }

  private getNextActionCta(actionId: string): string {
    switch (actionId) {
      case 'weight_checkin':
        return '去记录体重';
      case 'activity_complete':
        return '去记录运动';
      case 'evening_review':
      default:
        return '去做今晚复盘';
    }
  }
}
