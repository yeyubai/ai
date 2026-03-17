'use client';

import { useAsyncAction } from '@/shared/hooks/use-async-action';
import { updateGoal, updateProfile } from '../api/me.api';
import {
  buildMeSaveErrorMessage,
  meMessages,
} from '../copy/me.messages';
import { useMeFormDraftStore } from '../model/me-form-draft.store';
import {
  createMeGoalPayload,
  hasRequiredGoalWeights,
} from '../payloads/create-me-goal-payload';
import { createMeProfilePayload } from '../payloads/create-me-profile-payload';
import type { UserProfile, WeightGoal } from '../types/settings.types';

type SaveMeProfileInput = {
  profileDraft: UserProfile;
  goalDraft: WeightGoal;
};

type SaveMeProfileFeedback = {
  message: string | null;
  errorMessage: string | null;
};

export function useSaveMeProfileAction() {
  const markProfileSaved = useMeFormDraftStore((state) => state.markProfileSaved);
  const markGoalSaved = useMeFormDraftStore((state) => state.markGoalSaved);

  return useAsyncAction<SaveMeProfileInput, SaveMeProfileFeedback>(
    async ({ profileDraft, goalDraft }) => {
      if (!hasRequiredGoalWeights(goalDraft)) {
        return {
          message: null,
          errorMessage: meMessages.profile.missingGoalWeights,
        };
      }

      const [profileResult, goalResult] = await Promise.allSettled([
        updateProfile(createMeProfilePayload(profileDraft)),
        updateGoal(createMeGoalPayload(goalDraft)),
      ]);

      const successMessages: string[] = [];
      const errorMessages: string[] = [];

      if (profileResult.status === 'fulfilled') {
        markProfileSaved(profileResult.value);
        successMessages.push(meMessages.profile.profileSaved);
      } else {
        errorMessages.push(
          buildMeSaveErrorMessage('基础资料', profileResult.reason),
        );
      }

      if (goalResult.status === 'fulfilled') {
        markGoalSaved(goalResult.value);
        successMessages.push(meMessages.profile.goalSaved);
      } else {
        errorMessages.push(
          buildMeSaveErrorMessage('体重目标', goalResult.reason),
        );
      }

      if (successMessages.length === 2) {
        return {
          message: meMessages.profile.saveSuccess,
          errorMessage: null,
        };
      }

      return {
        message:
          successMessages.length > 0 ? `${successMessages.join('；')}。` : null,
        errorMessage: errorMessages.length > 0 ? errorMessages.join('；') : null,
      };
    },
  );
}
