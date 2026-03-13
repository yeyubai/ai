export type ProgressRangeData = {
  weightTrendPoints: Array<{
    date: string;
    weightKg: number | null;
    isMissing: boolean;
  }>;
  exerciseCompletionRate: number;
  burnKcalTotal: number;
  exerciseDays: number;
  weighInDays: number;
  milestone: {
    current: string;
    next: string;
  };
};

export type WeeklyReportData = {
  summary: {
    title: string;
    body: string;
  };
  lockedSections: string[];
  membershipPrompt: {
    show: boolean;
    reason: string;
  };
};
