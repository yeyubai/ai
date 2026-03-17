'use client';

import { useAsyncAction } from '@/shared/hooks/use-async-action';
import { createEveningReview } from '../api/review.api';
import { reviewMessages } from '../copy/review.messages';
import type { ReviewResult } from '../types/review.types';

export function useGenerateEveningReviewAction() {
  return useAsyncAction<string, ReviewResult>(createEveningReview, {
    fallbackMessage: reviewMessages.generate.failed,
  });
}
