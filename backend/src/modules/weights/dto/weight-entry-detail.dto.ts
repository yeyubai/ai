export class WeightMetricRangeSegmentDto {
  label!: string;
  min!: number | null;
  max!: number | null;
  color!: 'sky' | 'green' | 'amber' | 'rose';
}

export class WeightMetricRangeDto {
  metric!: 'weight' | 'bodyFat' | 'bmi';
  unit!: string;
  value!: number | null;
  level!: string | null;
  estimated!: boolean;
  thresholds!: number[];
  segments!: WeightMetricRangeSegmentDto[];
}

export class WeightEntryDetailDto {
  id!: string;
  entryDate!: string;
  measuredAt!: string;
  previousMeasuredAt!: string | null;
  syncStatus!: 'placeholder_unsynced';
  weightKg!: number;
  deltaFromPreviousKg!: number | null;
  deltaFromPreviousBodyFatPct!: number | null;
  weightLevel!: string | null;
  bmi!: number | null;
  bmiLevel!: string | null;
  estimatedBodyFatPct!: number | null;
  bodyFatLevel!: string | null;
  note!: string | null;
  ranges!: {
    weight: WeightMetricRangeDto;
    bodyFat: WeightMetricRangeDto;
    bmi: WeightMetricRangeDto;
  };
}
