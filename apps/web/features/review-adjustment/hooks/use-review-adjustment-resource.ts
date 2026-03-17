'use client';

import { fetchHomeToday } from '@/features/home-daily-loop/api/home.api';
import type { HomeTodayResult } from '@/features/home-daily-loop/types/home.types';
import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import { reviewMessages } from '../copy/review.messages';

export function useReviewAdjustmentResource(enabled: boolean) {
  return useAsyncResource<HomeTodayResult>(fetchHomeToday, [], {
    enabled,
    fallbackMessage: reviewMessages.overview.loadFailed,
  });
}
