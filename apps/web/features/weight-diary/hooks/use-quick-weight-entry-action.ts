'use client';

import { useAsyncAction } from '@/shared/hooks/use-async-action';
import { createWeightEntry } from '../api/weights.api';
import { weightDiaryMessages } from '../copy/weight-diary.messages';
import type {
  CreateWeightEntryPayload,
  WeightEntry,
} from '../types/weight-diary.types';

export function useQuickWeightEntryAction() {
  return useAsyncAction<CreateWeightEntryPayload, WeightEntry>(createWeightEntry, {
    fallbackMessage: weightDiaryMessages.home.saveFailed,
  });
}
