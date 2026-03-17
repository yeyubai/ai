'use client';

import { fetchTodaySummary } from '@/features/weight-diary/api/weights.api';
import type { WeightTodaySummary } from '@/features/weight-diary/types/weight-diary.types';
import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import { fetchGoal, fetchProfile, fetchSettings } from '../api/me.api';
import { meMessages } from '../copy/me.messages';
import type {
  UserProfile,
  UserSettings,
  WeightGoal,
} from '../types/settings.types';

type MeOverviewResourceData = {
  profile: UserProfile;
  goal: WeightGoal;
  settings: UserSettings;
  summary: WeightTodaySummary;
};

export function useMeOverviewResource(enabled: boolean) {
  return useAsyncResource<MeOverviewResourceData>(
    async () => {
      const [profileResponse, goalResponse, settingsResponse, summaryResponse] =
        await Promise.all([
          fetchProfile(),
          fetchGoal(),
          fetchSettings(),
          fetchTodaySummary(),
        ]);

      return {
        profile: profileResponse,
        goal: {
          ...goalResponse,
          weightUnit: settingsResponse.weightUnit,
        },
        settings: settingsResponse,
        summary: summaryResponse,
      };
    },
    [],
    {
      enabled,
      fallbackMessage: meMessages.overview.loadFailed,
    },
  );
}
