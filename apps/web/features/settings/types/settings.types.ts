export type UserProfile = {
  nickname: string | null;
  heightCm: number | null;
  sex: 'male' | 'female' | 'other' | null;
  birthDate: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

export type WeightGoal = {
  startWeightKg: number | null;
  targetWeightKg: number | null;
  targetDate: string | null;
  weightUnit: 'kg' | 'lb';
};

export type UserSettings = {
  diaryName: string;
  theme: 'aqua-mist' | 'sea-breeze' | 'paper-light';
  weightUnit: 'kg' | 'lb';
  exportEnabled: boolean;
};

export type UpdateUserProfilePayload = {
  nickname?: string;
  heightCm?: number;
  sex?: 'male' | 'female' | 'other';
  birthDate?: string;
  avatarUrl?: string;
};

export type UpdateWeightGoalPayload = {
  startWeightKg: number;
  targetWeightKg: number;
  targetDate?: string;
  weightUnit: 'kg' | 'lb';
};

export type UpdateUserSettingsPayload = {
  diaryName?: string;
  theme?: UserSettings['theme'];
};

export type ExportTask = {
  taskId: string;
  status: 'queued';
  message: string;
};
