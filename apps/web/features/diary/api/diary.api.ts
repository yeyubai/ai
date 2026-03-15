import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { DiaryEntry, DiaryEntryPayload, DiaryEntrySummary } from '../types/diary.types';

export async function fetchDiaryEntries(): Promise<DiaryEntrySummary[]> {
  const response = await apiClient.get<ApiResponse<{ entries: DiaryEntrySummary[] }>>(
    '/diary/entries',
  );
  return response.data.data.entries;
}

export async function fetchDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
  const response = await apiClient.get<ApiResponse<DiaryEntry>>(`/diary/entries/${entryId}`);
  return response.data.data;
}

export async function saveDiaryEntry(
  payload: DiaryEntryPayload,
  entryId?: string,
): Promise<DiaryEntry> {
  if (entryId) {
    const response = await apiClient.put<ApiResponse<DiaryEntry>>(
      `/diary/entries/${entryId}`,
      payload,
    );
    return response.data.data;
  }

  const response = await apiClient.post<ApiResponse<DiaryEntry>>('/diary/entries', payload);
  return response.data.data;
}
