export type AiPayloadSource = 'model' | 'fallback';

export type AiPlanMeal = {
  name: string;
  suggestion: string;
  kcal: number;
};

export type AiPlanActivity = {
  type: string;
  durationMin: number;
  intensity: 'low' | 'medium' | 'high';
};

export type AiPlan = {
  planId: string;
  date: string;
  calorieTargetKcal: number;
  meals: AiPlanMeal[];
  activity: AiPlanActivity;
  topActions: string[];
  riskFlags: string[];
  summaryText: string;
  source: AiPayloadSource;
};

export type AiReview = {
  reviewId: string;
  date: string;
  score: number;
  highlights: string[];
  gaps: string[];
  tomorrowFocus: string[];
  riskFlags: string[];
  summaryText: string;
  source: AiPayloadSource;
};

export type FetchAiPlanPayload = {
  date: string;
  forceRefresh?: boolean;
  timezone: string;
};

export type FetchAiReviewPayload = {
  date: string;
  timezone: string;
};
