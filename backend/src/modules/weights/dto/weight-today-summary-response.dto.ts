import { WeightEntryDto } from './weight-entry.dto';

export class WeightTodaySummaryResponseDto {
  latestEntry!: WeightEntryDto | null;
  todayEntry!: WeightEntryDto | null;
  goal!: {
    startWeightKg: number;
    targetWeightKg: number;
    targetDate: string | null;
    weightUnit: 'kg' | 'lb';
  } | null;
  deltaFromStart!: number | null;
  deltaFromPrevious!: number | null;
  bmi!: number | null;
  bodyFatPct!: number | null;
  recordDays!: number;
}
