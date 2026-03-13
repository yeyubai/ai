export class ProgressRangeResponseDto {
  weightTrendPoints!: Array<{
    date: string;
    weightKg: number | null;
    isMissing: boolean;
  }>;
  exerciseCompletionRate!: number;
  burnKcalTotal!: number;
  exerciseDays!: number;
  weighInDays!: number;
  milestone!: {
    current: string;
    next: string;
  };
}
