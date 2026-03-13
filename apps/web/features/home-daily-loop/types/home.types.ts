export type HomeMissionItem = {
  actionId: string;
  title: string;
  type: 'checkin' | 'behavior' | 'review';
  status: 'todo' | 'done';
  recommendedAt: string;
};

export type ActivityStatusCard = {
  completedToday: boolean;
  durationMin: number;
  estimatedKcal: number;
  targetDurationMin: number;
  targetBurnKcal: number;
  exerciseDays7d: number;
};

export type ExerciseCompletionSummary = {
  done: number;
  total: number;
  rate: number;
};

export type HomeFollowUpCard = {
  type: 'review' | 'tomorrow_preview' | 'trend' | 'none';
  title: string;
  cta: string;
};

export type HomeTodayData = {
  date: string;
  dailyMission: HomeMissionItem[];
  completion: ExerciseCompletionSummary;
  weightStatus: {
    latestWeightKg: number | null;
    weighedToday: boolean;
    weeklyChangeKg: number;
    targetWeightKg: number | null;
  };
  activityStatus: ActivityStatusCard;
  nextAction: {
    actionId: string;
    title: string;
    cta: string;
  };
  followUp: HomeFollowUpCard;
  membershipState: {
    plan: 'free' | 'coach_plus';
    entitlements: string[];
  };
  riskFlags: string[];
  recoveryMode: boolean;
  fallbackReason?: string | null;
};

export type HomeTodayResult = HomeTodayData & {
  responseCode: string | number;
};
