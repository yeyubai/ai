import axios, { AxiosError, AxiosHeaders } from 'axios';
import {
  getStoredSession,
  hasUsableSession,
} from '@/lib/session/session-storage';
import type { ApiError, ApiResponse } from './types';

type ApiErrorPayload = Partial<Pick<ApiResponse<null>, 'code' | 'message' | 'traceId'>>;

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function readAccessTokenFromStorage(): Promise<string | null> {
  const session = await getStoredSession();
  if (!session || !hasUsableSession(session.token, session.expiresAt)) {
    return null;
  }

  return session.token;
}

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:3001/api/v1`;
  }

  return 'http://localhost:3001/api/v1';
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const traceId = createTraceId();
  const headers = AxiosHeaders.from(config.headers);
  const accessToken = await readAccessTokenFromStorage();

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
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
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
