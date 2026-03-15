export class WeightStatsResponseDto {
  range!: '7d' | '30d' | '90d' | 'all';
  recordDays!: number;
  netChangeKg!: number | null;
  highestWeightKg!: number | null;
  lowestWeightKg!: number | null;
  startWeightKg!: number | null;
  latestWeightKg!: number | null;
}
