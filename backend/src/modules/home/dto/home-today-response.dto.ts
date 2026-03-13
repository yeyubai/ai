export class HomeTodayResponseDto {
  date!: string;
  dailyMission!: Array<{
    actionId: string;
    title: string;
    type: 'checkin' | 'behavior' | 'review';
    status: 'todo' | 'done';
    recommendedAt: string;
  }>;
  completion!: {
    done: number;
    total: number;
    rate: number;
  };
  weightStatus!: {
    latestWeightKg: number | null;
    weighedToday: boolean;
    weeklyChangeKg: number;
    targetWeightKg: number | null;
  };
  activityStatus!: {
    completedToday: boolean;
    durationMin: number;
    estimatedKcal: number;
    targetDurationMin: number;
    targetBurnKcal: number;
    exerciseDays7d: number;
  };
  nextAction!: {
    actionId: string;
    title: string;
    cta: string;
  };
  followUp!: {
    type: 'review' | 'tomorrow_preview' | 'trend' | 'none';
    title: string;
    cta: string;
  };
  membershipState!: {
    plan: 'free' | 'coach_plus';
    entitlements: string[];
  };
  riskFlags!: string[];
  recoveryMode!: boolean;
  fallbackReason?: string | null;
}
