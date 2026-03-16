'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserProfile, WeightGoal } from '../types/settings.types';

type MeFormDraftState = {
  profileDraft: UserProfile | null;
  profileDirty: boolean;
  goalDraft: WeightGoal | null;
  goalDirty: boolean;
  hydrateProfileDraft: (draft: UserProfile) => void;
  updateProfileDraft: (updater: (draft: UserProfile) => UserProfile) => void;
  markProfileSaved: (draft: UserProfile) => void;
  hydrateGoalDraft: (draft: WeightGoal) => void;
  updateGoalDraft: (updater: (draft: WeightGoal) => WeightGoal) => void;
  markGoalSaved: (draft: WeightGoal) => void;
};

export const useMeFormDraftStore = create<MeFormDraftState>()(
  persist(
    (set) => ({
      profileDraft: null,
      profileDirty: false,
      goalDraft: null,
      goalDirty: false,
      hydrateProfileDraft: (draft) =>
        set((state) => {
          if (state.profileDirty && state.profileDraft) {
            return state;
          }

          return {
            profileDraft: draft,
            profileDirty: false,
          };
        }),
      updateProfileDraft: (updater) =>
        set((state) => {
          if (!state.profileDraft) {
            return state;
          }

          return {
            profileDraft: updater(state.profileDraft),
            profileDirty: true,
          };
        }),
      markProfileSaved: (draft) =>
        set({
          profileDraft: draft,
          profileDirty: false,
        }),
      hydrateGoalDraft: (draft) =>
        set((state) => {
          if (state.goalDirty && state.goalDraft) {
            return state;
          }

          return {
            goalDraft: draft,
            goalDirty: false,
          };
        }),
      updateGoalDraft: (updater) =>
        set((state) => {
          if (!state.goalDraft) {
            return state;
          }

          return {
            goalDraft: updater(state.goalDraft),
            goalDirty: true,
          };
        }),
      markGoalSaved: (draft) =>
        set({
          goalDraft: draft,
          goalDirty: false,
        }),
    }),
    {
      name: 'me-form-draft-store',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
