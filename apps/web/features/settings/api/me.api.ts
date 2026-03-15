import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  ExportTask,
  UpdateUserProfilePayload,
  UpdateUserSettingsPayload,
  UpdateWeightGoalPayload,
  UserProfile,
  UserSettings,
  WeightGoal,
} from '../types/settings.types';

export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/me/profile');
  return response.data.data;
}

export async function updateProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
  const response = await apiClient.put<ApiResponse<UserProfile>>('/me/profile', payload);
  return response.data.data;
}

export async function fetchGoal(): Promise<WeightGoal> {
  const response = await apiClient.get<ApiResponse<WeightGoal>>('/me/goal');
  return response.data.data;
}

export async function updateGoal(
  payload: UpdateWeightGoalPayload,
): Promise<WeightGoal> {
  const response = await apiClient.put<ApiResponse<WeightGoal>>('/me/goal', payload);
  return response.data.data;
}

export async function fetchSettings(): Promise<UserSettings> {
  const response = await apiClient.get<ApiResponse<UserSettings>>('/me/settings');
  return response.data.data;
}

export async function updateSettings(
  payload: UpdateUserSettingsPayload,
): Promise<UserSettings> {
  const response = await apiClient.put<ApiResponse<UserSettings>>('/me/settings', payload);
  return response.data.data;
}

export async function requestExport(): Promise<ExportTask> {
  const response = await apiClient.post<ApiResponse<ExportTask>>('/me/export');
  return response.data.data;
}
