import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { AppSettings, DeleteStatus, ExportTask, MembershipStatus, ReminderSettings } from '../types/my-center.types';

export async function fetchMembershipStatus(): Promise<MembershipStatus> {
  const response = await apiClient.get<ApiResponse<MembershipStatus>>('/membership/status');
  return response.data.data;
}

export async function fetchReminderSettings(): Promise<ReminderSettings> {
  const response = await apiClient.get<ApiResponse<ReminderSettings>>('/reminders/settings');
  return response.data.data;
}

export async function updateReminderSettings(payload: ReminderSettings): Promise<ReminderSettings> {
  const response = await apiClient.put<ApiResponse<ReminderSettings>>('/reminders/settings', payload);
  return response.data.data;
}

export async function fetchReminderReceipts(): Promise<{ list: ReminderSettings[]; total: number }> {
  const response = await apiClient.get<ApiResponse<{ list: ReminderSettings[]; total: number }>>('/reminders/receipts');
  return response.data.data;
}

export async function fetchSettings(): Promise<AppSettings> {
  const response = await apiClient.get<ApiResponse<AppSettings>>('/settings');
  return response.data.data;
}

export async function updateSettings(payload: Partial<AppSettings>): Promise<AppSettings> {
  const response = await apiClient.put<ApiResponse<AppSettings>>('/settings', payload);
  return response.data.data;
}

export async function createExportTask(): Promise<ExportTask> {
  const response = await apiClient.post<ApiResponse<ExportTask>>('/account/export', { format: 'json' });
  return response.data.data;
}

export async function fetchExportTask(taskId: string): Promise<ExportTask> {
  const response = await apiClient.get<ApiResponse<ExportTask>>(`/account/export/${taskId}`);
  return response.data.data;
}

export async function createDeleteRequest(): Promise<DeleteStatus> {
  const response = await apiClient.post<ApiResponse<DeleteStatus>>('/account/delete-request', {
    reason: 'need_a_break',
    confirmText: 'DELETE',
  });
  return response.data.data;
}

export async function fetchDeleteRequest(): Promise<DeleteStatus> {
  const response = await apiClient.get<ApiResponse<DeleteStatus>>('/account/delete-request');
  return response.data.data;
}

export async function cancelDeleteRequest(): Promise<{ canceled: boolean }> {
  const response = await apiClient.delete<ApiResponse<{ canceled: boolean }>>('/account/delete-request');
  return response.data.data;
}
