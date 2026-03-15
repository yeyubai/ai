export class WeightGoalResponseDto {
  startWeightKg!: number | null;
  targetWeightKg!: number | null;
  targetDate!: string | null;
  weightUnit!: 'kg' | 'lb';
}
