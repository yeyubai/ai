export type CheckinSubmission = {
  submissionId: string;
  checkinType: 'weight' | 'meal' | 'activity' | 'sleep';
  checkinDate: string;
  isBackfillTag: boolean;
  createdAt: string;
};

export type WeightCheckinPayload = {
  checkinDate: string;
  measuredAt: string;
  weightKg: number;
  source: 'manual' | 'smart_scale';
  isBackfill: boolean;
};

export type MealCheckinPayload = {
  checkinDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  estimatedKcal?: number;
  imageUrl?: string;
  isBackfill: boolean;
};

export type ActivityCheckinPayload = {
  checkinDate: string;
  activityType: string;
  durationMin: number;
  steps?: number;
  estimatedKcal?: number;
  isBackfill: boolean;
};

export type SleepCheckinPayload = {
  checkinDate: string;
  sleepAt: string;
  wakeAt: string;
  durationMin: number;
  isBackfill: boolean;
};
