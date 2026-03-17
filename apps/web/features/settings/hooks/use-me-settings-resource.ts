'use client';

import { useAsyncResource } from '@/shared/hooks/use-async-resource';
import { fetchSettings } from '../api/me.api';
import { meMessages } from '../copy/me.messages';
import type { UserSettings } from '../types/settings.types';

export function useMeSettingsResource(enabled: boolean) {
  return useAsyncResource<UserSettings>(fetchSettings, [], {
    enabled,
    fallbackMessage: meMessages.preferences.loadFailed,
  });
}
