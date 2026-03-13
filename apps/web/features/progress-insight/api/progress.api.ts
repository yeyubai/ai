import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { ProgressRangeData, WeeklyReportData } from '../types/progress.types';

export async function fetchWeeklyProgress(): Promise<ProgressRangeData> {
  const response = await apiClient.get<ApiResponse<ProgressRangeData>>('/progress/weekly');
  return response.data.data;
}

export async function fetchMonthlyProgress(): Promise<ProgressRangeData> {
  const response = await apiClient.get<ApiResponse<ProgressRangeData>>('/progress/monthly');
  return response.data.data;
}

export async function fetchWeeklyReport(): Promise<WeeklyReportData> {
  const response = await apiClient.get<ApiResponse<WeeklyReportData>>('/progress/weekly-report');
  return response.data.data;
}
