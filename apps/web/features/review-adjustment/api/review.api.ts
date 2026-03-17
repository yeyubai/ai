import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { ReviewResult } from '../types/review.types';

export async function createEveningReview(date: string): Promise<ReviewResult> {
  const response = await apiClient.post<ApiResponse<Omit<ReviewResult, 'responseCode'>>>(
    '/review/evening',
    {
      date,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      triggerSource: 'home_review_card',
    },
  );
  return {
    ...response.data.data,
    responseCode: response.data.code,
  };
}

export async function skipReview(date: string) {
  const response = await apiClient.post<ApiResponse<{ skipped: true; reason: string }>>(
    '/review/skip',
    {
      date,
      reason: 'too_late',
    },
  );
  return response.data.data;
}
