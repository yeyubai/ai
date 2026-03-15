export type WeightEntry = {
  id: string;
  entryDate: string;
  measuredAt: string;
  syncStatus: 'placeholder_unsynced';
  weightKg: number;
  bodyFatPct: number | null;
  note: string | null;
  source: 'manual';
  deltaFromPreviousKg: number | null;
};

export type WeightGoalSummary = {
  startWeightKg: number;
  targetWeightKg: number;
  targetDate: string | null;
  weightUnit: 'kg' | 'lb';
};

export type WeightTodaySummary = {
  latestEntry: WeightEntry | null;
  todayEntry: WeightEntry | null;
  goal: WeightGoalSummary | null;
  deltaFromStart: number | null;
  deltaFromPrevious: number | null;
  bmi: number | null;
  bodyFatPct: number | null;
  recordDays: number;
};

export type WeightStats = {
  range: '7d' | '30d' | '90d' | 'all';
  recordDays: number;
  netChangeKg: number | null;
  highestWeightKg: number | null;
  lowestWeightKg: number | null;
  startWeightKg: number | null;
  latestWeightKg: number | null;
};

export type WeightTrend = {
  range: '7d' | '30d' | '90d' | 'all';
  points: Array<{
    date: string;
    weightKg: number | null;
  }>;
};

export type WeightEntryGroups = {
  groups: Array<{
    date: string;
    entries: WeightEntry[];
  }>;
  nextCursor: string | null;
};

export type RangeColor = 'sky' | 'green' | 'amber' | 'rose';

export type WeightMetricRange = {
  metric: 'weight' | 'bodyFat' | 'bmi';
  unit: string;
  value: number | null;
  level: string | null;
  estimated: boolean;
  thresholds: number[];
  segments: Array<{
    label: string;
    min: number | null;
    max: number | null;
    color: RangeColor;
  }>;
};

export type WeightEntryDetail = {
  id: string;
  entryDate: string;
  measuredAt: string;
  previousMeasuredAt: string | null;
  syncStatus: 'placeholder_unsynced';
  weightKg: number;
  deltaFromPreviousKg: number | null;
  deltaFromPreviousBodyFatPct: number | null;
  weightLevel: string | null;
  bmi: number | null;
  bmiLevel: string | null;
  estimatedBodyFatPct: number | null;
  bodyFatLevel: string | null;
  note: string | null;
  ranges: {
    weight: WeightMetricRange;
    bodyFat: WeightMetricRange;
    bmi: WeightMetricRange;
  };
};

export type CreateWeightEntryPayload = {
  entryDate: string;
  measuredAt: string;
  weightKg: number;
  bodyFatPct?: number;
  note?: string;
};

export type UpdateWeightEntryPayload = CreateWeightEntryPayload;
