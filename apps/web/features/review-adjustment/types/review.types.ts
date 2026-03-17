export type ReviewResult = {
  reviewSummary: {
    score: number;
    highlights: string[];
    gaps: string[];
  };
  tomorrowPreview: {
    focus: string[];
    maxTasks: number;
  };
  recoveryMode: boolean;
  fallbackReason: string | null;
  confidence: number;
  responseCode: string | number;
};
