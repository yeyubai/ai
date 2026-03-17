'use client';

import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import {
  fetchMonthlyProgress,
  fetchWeeklyProgress,
  fetchWeeklyReport,
} from '../api/progress.api';
import { progressMessages } from '../copy/progress.messages';
import type {
  ProgressInsightResourceData,
  ProgressRange,
} from '../types/progress.types';

export function useProgressInsightResource(
  range: ProgressRange,
  enabled: boolean,
) {
  return useAsyncResource<ProgressInsightResourceData>(
    async () => {
      const [progress, report] = await Promise.all([
        range === 'weekly' ? fetchWeeklyProgress() : fetchMonthlyProgress(),
        fetchWeeklyReport(),
      ]);

      return {
        progress,
        report,
      };
    },
    [range],
    {
      enabled,
      fallbackMessage: progressMessages.loadFailed,
    },
  );
}
