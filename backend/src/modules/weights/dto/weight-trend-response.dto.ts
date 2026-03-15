export class WeightTrendResponseDto {
  range!: '7d' | '30d' | '90d' | 'all';
  points!: Array<{
    date: string;
    weightKg: number | null;
  }>;
}
