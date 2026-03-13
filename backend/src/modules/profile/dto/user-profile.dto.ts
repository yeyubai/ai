export class UserProfileDto {
  phone!: string;
  profileCompleted!: boolean;
  heightCm!: number | null;
  currentWeightKg!: number | null;
  targetWeightKg!: number | null;
  goalWeeks!: number | null;
  workRestPattern!: string | null;
  dietPreference!: string | null;
  activityBaseline!: string | null;
  motivationPattern!: string | null;
}
