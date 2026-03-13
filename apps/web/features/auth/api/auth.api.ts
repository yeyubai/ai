import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { LoginRequest, LoginResult } from '../types/auth.types';

export async function postLogin(payload: LoginRequest): Promise<LoginResult> {
  const response = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', payload);
  return response.data.data;
}
