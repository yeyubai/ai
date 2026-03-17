'use client';

import { useAsyncAction } from '@/shared/hooks/use-async-action';
import { requestExport } from '../api/me.api';
import { meMessages } from '../copy/me.messages';
import type { ExportTask } from '../types/settings.types';

export function useRequestMeExportAction() {
  return useAsyncAction<void, ExportTask>(async () => requestExport(), {
    fallbackMessage: meMessages.overview.exportFailed,
  });
}
