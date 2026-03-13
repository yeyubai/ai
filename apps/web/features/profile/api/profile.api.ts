import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { UpdateProfilePayload, UserProfile } from '../types/profile.types';

function createAuthHeaders(accessToken?: string): Record<string, string> {
  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchProfile(accessToken?: string): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/profile', {
    headers: createAuthHeaders(accessToken),
  });
  return response.data.data;
}

export async function putProfile(
  payload: UpdateProfilePayload,
  accessToken?: string,
): Promise<UserProfile> {
  const response = await apiClient.put<ApiResponse<UserProfile>>(
    '/profile',
    payload,
    {
      headers: createAuthHeaders(accessToken),
    },
  );
  return response.data.data;
}
