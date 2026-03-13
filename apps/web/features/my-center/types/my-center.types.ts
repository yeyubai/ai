export type MembershipStatus = {
  plan: 'free' | 'coach_plus';
  entitlements: {
    deepReview: boolean;
    weeklyInsight: boolean;
    strongReminder: boolean;
  };
  upgradePrompts: Array<{
    touchpoint: string;
    headline: string;
  }>;
};

export type ReminderSettings = {
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

export type AppSettings = {
  weightUnit: 'kg' | 'lb';
  timezone: string;
  locale: string;
};

export type ExportTask = {
  taskId: string;
  status: 'processing' | 'done';
  downloadUrl?: string | null;
  expiresAt?: string | null;
};

export type DeleteStatus = {
  status: 'pending_cooldown';
  requestedAt: string;
  effectiveAt: string;
  canCancel: boolean;
};
