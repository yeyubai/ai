export type UserProfile = {
  phone: string;
  profileCompleted: boolean;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
};

export type UpdateProfilePayload = {
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
};
