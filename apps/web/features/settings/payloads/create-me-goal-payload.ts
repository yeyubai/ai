import type {
  UpdateWeightGoalPayload,
  WeightGoal,
} from '../types/settings.types';

type MeGoalDraftWithRequiredWeights = WeightGoal & {
  startWeightKg: number;
  targetWeightKg: number;
};

export function hasRequiredGoalWeights(
  goalDraft: WeightGoal,
): goalDraft is MeGoalDraftWithRequiredWeights {
  return (
    typeof goalDraft.startWeightKg === 'number' &&
    typeof goalDraft.targetWeightKg === 'number'
  );
}

export function createMeGoalPayload(
  goalDraft: MeGoalDraftWithRequiredWeights,
): UpdateWeightGoalPayload {
  return {
    startWeightKg: goalDraft.startWeightKg,
    targetWeightKg: goalDraft.targetWeightKg,
    targetDate: goalDraft.targetDate ?? undefined,
    weightUnit: goalDraft.weightUnit,
  };
}
