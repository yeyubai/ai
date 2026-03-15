import { updateProfile, updateGoal } from '@/features/settings/api/me.api';
import type { UserProfile, WeightGoal } from '@/features/settings/types/settings.types';

export async function completeOnboarding(payload: {
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  weightUnit: 'kg' | 'lb';
}): Promise<{ profile: UserProfile; goal: WeightGoal }> {
  const [profile, goal] = await Promise.all([
    updateProfile({ heightCm: payload.heightCm }),
    updateGoal({
      startWeightKg: payload.startWeightKg,
      targetWeightKg: payload.targetWeightKg,
      weightUnit: payload.weightUnit,
    }),
  ]);

  return { profile, goal };
}
