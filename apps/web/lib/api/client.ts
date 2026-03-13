import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { ApiError, ApiResponse } from './types';

type ApiErrorPayload = Partial<Pick<ApiResponse<null>, 'code' | 'message' | 'traceId'>>;
type PersistedAuthStore = {
  state?: {
    token?: string | null;
  };
};

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function readAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawAuthStore = window.localStorage.getItem('auth-store');
  if (!rawAuthStore) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawAuthStore) as PersistedAuthStore;
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const traceId = createTraceId();
  const headers = AxiosHeaders.from(config.headers);
  const accessToken = readAccessTokenFromStorage();

  headers.set('x-trace-id', traceId);
  if (accessToken && !headers.get('authorization')) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  config.headers = headers;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const payload = error.response?.data;
    const normalizedError: ApiError = {
      status: error.response?.status ?? 500,
      code: payload?.code ?? error.response?.status ?? 'INTERNAL_ERROR',
      message:
        typeof payload?.message === 'string' ? payload.message : error.message ?? 'Request failed',
      traceId: typeof payload?.traceId === 'string' ? payload.traceId : undefined,
    };

    return Promise.reject(normalizedError);
  },
);
