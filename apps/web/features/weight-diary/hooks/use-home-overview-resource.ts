'use client';

import { fetchSettings } from '@/features/settings/api/me.api';
import type { UserSettings } from '@/features/settings/types/settings.types';
import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import { weightDiaryMessages } from '../copy/weight-diary.messages';
import {
  fetchTodaySummary,
  fetchWeightEntries,
} from '../api/weights.api';
import type {
  WeightEntryGroups,
  WeightTodaySummary,
} from '../types/weight-diary.types';

type HomeOverviewResourceData = {
  summary: WeightTodaySummary;
  settings: UserSettings;
  entries: WeightEntryGroups;
};

export function useHomeOverviewResource(enabled: boolean) {
  return useAsyncResource<HomeOverviewResourceData>(
    async () => {
      const [summary, settings, entries] = await Promise.all([
        fetchTodaySummary(),
        fetchSettings(),
        fetchWeightEntries(),
      ]);

      return {
        summary,
        settings,
        entries,
      };
    },
    [],
    {
      enabled,
      fallbackMessage: weightDiaryMessages.home.loadFailed,
    },
  );
}
