export type AiPayloadSource = 'model' | 'fallback';

export class AiPlanMealDto {
  name!: string;
  suggestion!: string;
  kcal!: number;
}

export class AiPlanActivityDto {
  type!: string;
  durationMin!: number;
  intensity!: 'low' | 'medium' | 'high';
}

export class AiPlanResponseDto {
  planId!: string;
  date!: string;
  calorieTargetKcal!: number;
  meals!: AiPlanMealDto[];
  activity!: AiPlanActivityDto;
  topActions!: string[];
  riskFlags!: string[];
  summaryText!: string;
  source!: AiPayloadSource;
}
