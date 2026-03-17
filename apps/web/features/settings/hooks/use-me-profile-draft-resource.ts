'use client';

import { useEffect } from 'react';
import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import { fetchGoal, fetchProfile, fetchSettings } from '../api/me.api';
import { meMessages } from '../copy/me.messages';
import { useMeFormDraftStore } from '../model/me-form-draft.store';
import type { UserProfile, WeightGoal } from '../types/settings.types';

type MeProfileDraftResourceData = {
  profile: UserProfile;
  goal: WeightGoal;
};

type UseMeProfileDraftResourceParams = {
  canLoad: boolean;
  ownerKey: string | null;
  sessionReady: boolean;
};

export function useMeProfileDraftResource({
  canLoad,
  ownerKey,
  sessionReady,
}: UseMeProfileDraftResourceParams) {
  const ensureDraftOwner = useMeFormDraftStore((state) => state.ensureDraftOwner);
  const hydrateProfileDraft = useMeFormDraftStore((state) => state.hydrateProfileDraft);
  const hydrateGoalDraft = useMeFormDraftStore((state) => state.hydrateGoalDraft);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    ensureDraftOwner(ownerKey);
  }, [ensureDraftOwner, ownerKey, sessionReady]);

  return useAsyncResource<MeProfileDraftResourceData>(
    async () => {
      const [profileResponse, goalResponse, settingsResponse] = await Promise.all([
        fetchProfile(),
        fetchGoal(),
        fetchSettings(),
      ]);

      return {
        profile: profileResponse,
        goal: {
          ...goalResponse,
          weightUnit: settingsResponse.weightUnit,
        },
      };
    },
    [ownerKey],
    {
      enabled: canLoad,
      fallbackMessage: meMessages.profile.loadFailed,
      onSuccess: ({ profile, goal }) => {
        hydrateProfileDraft(profile);
        hydrateGoalDraft(goal);
      },
    },
  );
}
