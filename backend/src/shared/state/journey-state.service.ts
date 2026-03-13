import { Injectable } from '@nestjs/common';

type ProfileExtras = {
  goalWeeks: number | null;
  workRestPattern: string | null;
  dietPreference: string | null;
  activityBaseline: string | null;
  motivationPattern: string | null;
};

type AssessmentState = {
  assessmentId: string;
  recommendedDailyActions: string[];
  completedAt: string | null;
};

type MembershipPlan = 'free' | 'coach_plus';

type MembershipEntitlements = {
  deepReview: boolean;
  weeklyInsight: boolean;
  strongReminder: boolean;
};

type MembershipStatus = {
  plan: MembershipPlan;
  entitlements: MembershipEntitlements;
  upgradePrompts: Array<{
    touchpoint: string;
    headline: string;
  }>;
};

type ReminderSettings = {
  dailyMissionReminderTimes: string[];
  reviewReminderTime: string;
  strongReminderEnabled: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  timezone: string;
  updatedAt: string;
};

type UserSettings = {
  weightUnit: 'kg' | 'lb';
  timezone: string;
  locale: string;
};

type ReviewState = {
  reviewSummary: {
    score: number;
    highlights: string[];
    gaps: string[];
  };
  tomorrowPreview: {
    focus: string[];
    maxTasks: number;
  };
  recoveryMode: boolean;
  fallbackReason: string | null;
  confidence: number;
  completedAt: string;
};

type ExportTask = {
  taskId: string;
  status: 'processing' | 'done';
  downloadUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type DeleteRequest = {
  status: 'pending_cooldown';
  requestedAt: string;
  effectiveAt: string;
  canCancel: boolean;
  reason: string;
};

@Injectable()
export class JourneyStateService {
  private readonly profileExtras = new Map<string, ProfileExtras>();
  private readonly assessments = new Map<string, AssessmentState>();
  private readonly memberships = new Map<string, MembershipStatus>();
  private readonly reminders = new Map<string, ReminderSettings>();
  private readonly settings = new Map<string, UserSettings>();
  private readonly completedActions = new Map<string, Set<string>>();
  private readonly reviews = new Map<string, ReviewState>();
  private readonly exports = new Map<string, ExportTask[]>();
  private readonly deleteRequests = new Map<string, DeleteRequest>();

  getProfileExtras(userId: bigint): ProfileExtras {
    const key = this.userKey(userId);
    const existing = this.profileExtras.get(key);
    if (existing) {
      return existing;
    }

    const defaults: ProfileExtras = {
      goalWeeks: 12,
      workRestPattern: '23:30-07:30',
      dietPreference: 'high-protein',
      activityBaseline: 'light',
      motivationPattern: 'restart_after_break',
    };
    this.profileExtras.set(key, defaults);
    return defaults;
  }

  updateProfileExtras(userId: bigint, patch: Partial<ProfileExtras>): ProfileExtras {
    const next = {
      ...this.getProfileExtras(userId),
      ...patch,
    };
    this.profileExtras.set(this.userKey(userId), next);
    return next;
  }

  saveAssessment(userId: bigint, patch: Partial<ProfileExtras>): AssessmentState {
    const extras = this.updateProfileExtras(userId, patch);
    const assessment: AssessmentState = {
      assessmentId: `oa_${Date.now()}`,
      recommendedDailyActions: this.buildRecommendedActions(extras),
      completedAt: null,
    };
    this.assessments.set(this.userKey(userId), assessment);
    return assessment;
  }

  completeOnboarding(userId: bigint): AssessmentState {
    const existing = this.assessments.get(this.userKey(userId)) ?? {
      assessmentId: `oa_${Date.now()}`,
      recommendedDailyActions: this.buildRecommendedActions(this.getProfileExtras(userId)),
      completedAt: null,
    };

    const completed = {
      ...existing,
      completedAt: new Date().toISOString(),
    };
    this.assessments.set(this.userKey(userId), completed);
    return completed;
  }

  getMembershipStatus(userId: bigint): MembershipStatus {
    const key = this.userKey(userId);
    const existing = this.memberships.get(key);
    if (existing) {
      return existing;
    }

    const defaults: MembershipStatus = {
      plan: 'free',
      entitlements: {
        deepReview: false,
        weeklyInsight: false,
        strongReminder: false,
      },
      upgradePrompts: [
        {
          touchpoint: 'after_first_checkin',
          headline: '想更稳地坚持下去？',
        },
        {
          touchpoint: 'weekly_report_value_moment',
          headline: '继续看懂自己的变化，可以解锁更细的周报。',
        },
      ],
    };
    this.memberships.set(key, defaults);
    return defaults;
  }

  getReminderSettings(userId: bigint): ReminderSettings {
    const key = this.userKey(userId);
    const existing = this.reminders.get(key);
    if (existing) {
      return existing;
    }

    const defaults: ReminderSettings = {
      dailyMissionReminderTimes: ['08:30', '20:00'],
      reviewReminderTime: '21:30',
      strongReminderEnabled: false,
      quietHours: {
        start: '22:30',
        end: '08:00',
      },
      timezone: this.getSettings(userId).timezone,
      updatedAt: new Date().toISOString(),
    };
    this.reminders.set(key, defaults);
    return defaults;
  }

  updateReminderSettings(
    userId: bigint,
    patch: Omit<ReminderSettings, 'updatedAt'>,
  ): ReminderSettings {
    const next: ReminderSettings = {
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.reminders.set(this.userKey(userId), next);
    return next;
  }

  getSettings(userId: bigint): UserSettings {
    const key = this.userKey(userId);
    const existing = this.settings.get(key);
    if (existing) {
      return existing;
    }

    const defaults: UserSettings = {
      weightUnit: 'kg',
      timezone: 'Asia/Shanghai',
      locale: 'zh-CN',
    };
    this.settings.set(key, defaults);
    return defaults;
  }

  updateSettings(userId: bigint, patch: Partial<UserSettings>): UserSettings {
    const next = {
      ...this.getSettings(userId),
      ...patch,
    };
    this.settings.set(this.userKey(userId), next);
    return next;
  }

  isActionCompleted(userId: bigint, date: string, actionId: string): boolean {
    return this.getCompletedActionSet(userId, date).has(actionId);
  }

  completeAction(userId: bigint, date: string, actionId: string): void {
    const set = this.getCompletedActionSet(userId, date);
    set.add(actionId);
    this.completedActions.set(this.actionKey(userId, date), set);
  }

  getCompletedActions(userId: bigint, date: string): string[] {
    return Array.from(this.getCompletedActionSet(userId, date));
  }

  saveReview(userId: bigint, date: string, review: ReviewState): void {
    this.reviews.set(this.actionKey(userId, date), review);
  }

  getReview(userId: bigint, date: string): ReviewState | null {
    return this.reviews.get(this.actionKey(userId, date)) ?? null;
  }

  createExportTask(userId: bigint): ExportTask {
    const task: ExportTask = {
      taskId: `exp_${Date.now()}`,
      status: 'processing',
      downloadUrl: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    };
    const items = this.exports.get(this.userKey(userId)) ?? [];
    items.unshift(task);
    this.exports.set(this.userKey(userId), items);
    return task;
  }

  getExportTask(userId: bigint, taskId: string): ExportTask | null {
    const task = (this.exports.get(this.userKey(userId)) ?? []).find(
      (item) => item.taskId === taskId,
    );
    if (!task) {
      return null;
    }

    if (task.status === 'processing') {
      task.status = 'done';
      task.downloadUrl = `https://downloads.example.com/${taskId}.json`;
      task.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }

    return task;
  }

  createDeleteRequest(userId: bigint, reason: string): DeleteRequest {
    const now = new Date();
    const request: DeleteRequest = {
      status: 'pending_cooldown',
      requestedAt: now.toISOString(),
      effectiveAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      canCancel: true,
      reason,
    };
    this.deleteRequests.set(this.userKey(userId), request);
    return request;
  }

  getDeleteRequest(userId: bigint): DeleteRequest | null {
    return this.deleteRequests.get(this.userKey(userId)) ?? null;
  }

  cancelDeleteRequest(userId: bigint): boolean {
    return this.deleteRequests.delete(this.userKey(userId));
  }

  private buildRecommendedActions(extras: ProfileExtras): string[] {
    const walkMinutes = extras.activityBaseline === 'light' ? 15 : 25;
    return [
      '晨起称重一次',
      `午餐后步行 ${walkMinutes} 分钟`,
      '晚间花 1 分钟复盘今天',
    ];
  }

  private getCompletedActionSet(userId: bigint, date: string): Set<string> {
    return this.completedActions.get(this.actionKey(userId, date)) ?? new Set<string>();
  }

  private actionKey(userId: bigint, date: string): string {
    return `${this.userKey(userId)}:${date}`;
  }

  private userKey(userId: bigint): string {
    return userId.toString();
  }
}
