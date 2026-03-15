import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  CreateWeightEntryPayload,
  WeightEntryDetail,
  UpdateWeightEntryPayload,
  WeightEntry,
  WeightEntryGroups,
  WeightStats,
  WeightTodaySummary,
  WeightTrend,
} from '../types/weight-diary.types';

type WeightRange = '7d' | '30d' | '90d' | 'all';

export async function fetchTodaySummary(): Promise<WeightTodaySummary> {
  const response = await apiClient.get<ApiResponse<WeightTodaySummary>>('/weights/today-summary');
  return response.data.data;
}

export async function fetchWeightStats(range: WeightRange): Promise<WeightStats> {
  const response = await apiClient.get<ApiResponse<WeightStats>>('/weights/stats', {
    params: { range },
  });
  return response.data.data;
}

export async function fetchWeightTrend(range: WeightRange): Promise<WeightTrend> {
  const response = await apiClient.get<ApiResponse<WeightTrend>>('/weights/trend', {
    params: { range },
  });
  return response.data.data;
}

export async function fetchWeightEntries(): Promise<WeightEntryGroups> {
  const response = await apiClient.get<ApiResponse<WeightEntryGroups>>('/weights/entries');
  return response.data.data;
}

export async function fetchWeightEntry(entryId: string): Promise<WeightEntryDetail> {
  const response = await apiClient.get<ApiResponse<WeightEntryDetail>>(`/weights/entries/${entryId}`);
  return response.data.data;
}

export async function createWeightEntry(
  payload: CreateWeightEntryPayload,
): Promise<WeightEntry> {
  const response = await apiClient.post<ApiResponse<WeightEntry>>('/weights/entries', payload);
  return response.data.data;
}

export async function updateWeightEntry(
  entryId: string,
  payload: UpdateWeightEntryPayload,
): Promise<WeightEntry> {
  const response = await apiClient.put<ApiResponse<WeightEntry>>(
    `/weights/entries/${entryId}`,
    payload,
  );
  return response.data.data;
}

export async function deleteWeightEntry(entryId: string): Promise<{ deleted: true }> {
  const response = await apiClient.delete<ApiResponse<{ deleted: true }>>(
    `/weights/entries/${entryId}`,
  );
  return response.data.data;
}
