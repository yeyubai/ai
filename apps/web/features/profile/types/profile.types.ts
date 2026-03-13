export type UserProfile = {
  phone: string;
  profileCompleted: boolean;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  goalWeeks: number | null;
  workRestPattern: string | null;
  dietPreference: string | null;
  activityBaseline: string | null;
  motivationPattern: string | null;
};

export type UpdateProfilePayload = {
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goalWeeks?: number;
  workRestPattern?: string;
  dietPreference?: string;
  activityBaseline?: string;
  motivationPattern?: string;
};
