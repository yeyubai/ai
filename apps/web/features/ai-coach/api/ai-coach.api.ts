import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  AiPlan,
  AiReview,
  FetchAiPlanPayload,
  FetchAiReviewPayload,
} from '../types/ai-coach.types';

type AiPlanApiData = {
  planId: string;
  date: string;
  calorieTargetKcal: number;
  meals: Array<{
    name: string;
    suggestion: string;
    kcal: number;
  }>;
  activity: {
    type: string;
    durationMin: number;
    intensity: 'low' | 'medium' | 'high';
  };
  topActions: string[];
  riskFlags: string[];
  summaryText: string;
  source: 'model' | 'fallback';
};

type AiReviewApiData = {
  reviewId: string;
  date: string;
  score: number;
  highlights: string[];
  gaps: string[];
  tomorrowFocus: string[];
  riskFlags: string[];
  summaryText: string;
  source: 'model' | 'fallback';
};

function toPlan(data: AiPlanApiData): AiPlan {
  return {
    planId: data.planId,
    date: data.date,
    calorieTargetKcal: data.calorieTargetKcal,
    meals: data.meals,
    activity: data.activity,
    topActions: data.topActions,
    riskFlags: data.riskFlags,
    summaryText: data.summaryText,
    source: data.source,
  };
}

function toReview(data: AiReviewApiData): AiReview {
  return {
    reviewId: data.reviewId,
    date: data.date,
    score: data.score,
    highlights: data.highlights,
    gaps: data.gaps,
    tomorrowFocus: data.tomorrowFocus,
    riskFlags: data.riskFlags,
    summaryText: data.summaryText,
    source: data.source,
  };
}

export async function postAiPlan(payload: FetchAiPlanPayload): Promise<AiPlan> {
  const response = await apiClient.post<ApiResponse<AiPlanApiData>>('/ai/plan', payload);
  return toPlan(response.data.data);
}

export async function postAiReview(payload: FetchAiReviewPayload): Promise<AiReview> {
  const response = await apiClient.post<ApiResponse<AiReviewApiData>>('/ai/review', payload);
  return toReview(response.data.data);
}
