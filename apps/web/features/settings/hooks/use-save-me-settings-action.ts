'use client';

import { useAsyncAction } from '@/shared/hooks/use-async-action';
import { updateSettings } from '../api/me.api';
import { meMessages } from '../copy/me.messages';
import type { UserSettings } from '../types/settings.types';

export function useSaveMeSettingsAction() {
  return useAsyncAction<UserSettings, UserSettings>(
    async (settingsDraft) =>
      updateSettings({
        diaryName: settingsDraft.diaryName,
        theme: settingsDraft.theme,
      }),
    {
      fallbackMessage: meMessages.preferences.saveFailed,
    },
  );
}
