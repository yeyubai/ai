import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { HomeTodayData, HomeTodayResult } from '../types/home.types';

export async function fetchHomeToday(): Promise<HomeTodayResult> {
  const response = await apiClient.get<ApiResponse<HomeTodayData>>('/home/today');
  return {
    ...response.data.data,
    responseCode: response.data.code,
  };
}

export async function completeHomeAction(actionId: string) {
  const response = await apiClient.post<ApiResponse<{ actionId: string; status: 'done'; refreshHome: boolean }>>(
    `/home/actions/${actionId}/complete`,
    {
      source: 'home_card',
      completedAt: new Date().toISOString(),
    },
  );
  return response.data.data;
}
