export class UserProfileResponseDto {
  nickname!: string | null;
  heightCm!: number | null;
  sex!: 'male' | 'female' | 'other' | null;
  birthDate!: string | null;
  avatarUrl!: string | null;
  onboardingCompleted!: boolean;
}
