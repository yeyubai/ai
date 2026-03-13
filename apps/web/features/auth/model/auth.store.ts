'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isApiError } from '@/lib/api/types';
import { postLogin } from '../api/auth.api';
import type { LoginRequest } from '../types/auth.types';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  loginStatus: LoginStatus;
  loginError: string | null;
  traceId: string | null;
  login: (payload: LoginRequest) => Promise<boolean>;
  clearLoginError: () => void;
  logout: () => void;
};

type PersistedAuthState = Pick<AuthState, 'token' | 'refreshToken' | 'expiresIn'>;

function mapLoginError(code: string | number): string {
  if (code === 'INVALID_PARAMS') {
    return '手机号或验证码不正确，请检查后重试。';
  }

  if (code === 'AUTH_EXPIRED') {
    return '登录状态已过期，请重新登录。';
  }

  if (code === 'AUTH_RATE_LIMIT') {
    return '请求过于频繁，请稍后再试。';
  }

  return '登录失败，请稍后重试。';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiresIn: null,
      loginStatus: 'idle',
      loginError: null,
      traceId: null,
      login: async (payload) => {
        set({
          loginStatus: 'loading',
          loginError: null,
          traceId: null,
        });

        try {
          const result = await postLogin(payload);
          set({
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            loginStatus: 'success',
            loginError: null,
            traceId: null,
          });
          return true;
        } catch (error) {
          const code = isApiError(error) ? error.code : 'INTERNAL_ERROR';
          set({
            loginStatus: 'error',
            loginError: mapLoginError(code),
            traceId: isApiError(error) ? error.traceId ?? null : null,
          });
          return false;
        }
      },
      clearLoginError: () =>
        set({
          loginError: null,
          traceId: null,
          loginStatus: 'idle',
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          expiresIn: null,
          loginStatus: 'idle',
          loginError: null,
          traceId: null,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAuthState => ({
        token: state.token,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
      }),
    },
  ),
);
