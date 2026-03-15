import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { CoachChatReply, CoachLatestSessionResponse, CoachSession } from '../types/coach.types';

export async function fetchLatestCoachSession(): Promise<CoachLatestSessionResponse> {
  const response = await apiClient.get<ApiResponse<CoachLatestSessionResponse>>('/me/coach/sessions');
  return response.data.data;
}

export async function fetchCoachSession(sessionId: string): Promise<CoachSession> {
  const response = await apiClient.get<ApiResponse<CoachSession>>(`/me/coach/sessions/${sessionId}`);
  return response.data.data;
}

export async function createCoachAnalysis(file: File): Promise<CoachSession> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<ApiResponse<CoachSession>>(
    '/me/coach/analysis',
    formData,
    {
      timeout: 60000,
    },
  );
  return response.data.data;
}

export async function createCoachMessage(
  sessionId: string,
  content: string,
): Promise<CoachChatReply> {
  const response = await apiClient.post<ApiResponse<CoachChatReply>>(
    `/me/coach/sessions/${sessionId}/messages`,
    { content },
  );
  return response.data.data;
}
