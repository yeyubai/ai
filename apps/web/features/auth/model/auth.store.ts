'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isApiError } from '@/lib/api/types';
import { postGuestSession, postLogin } from '../api/auth.api';
import type { LoginRequest, UserRole, UserStatus } from '../types/auth.types';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';
type SessionStatus = 'idle' | 'loading' | 'ready' | 'error';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  userStatus: UserStatus | null;
  userRole: UserRole | null;
  loginStatus: LoginStatus;
  sessionStatus: SessionStatus;
  loginError: string | null;
  traceId: string | null;
  login: (payload: LoginRequest) => Promise<boolean>;
  ensureGuestSession: () => Promise<void>;
  setUserStatus: (userStatus: UserStatus) => void;
  clearLoginError: () => void;
  logout: () => void;
};

type PersistedAuthState = Pick<
  AuthState,
  'token' | 'refreshToken' | 'expiresIn' | 'userStatus' | 'userRole'
>;

function mapLoginError(code: string | number): string {
  if (code === 'INVALID_PARAMS') {
    return '手机号或验证码不正确，请检查后重试。';
  }

  if (code === 'AUTH_RATE_LIMIT') {
    return '请求过于频繁，请稍后再试。';
  }

  return '登录失败，请稍后重试。';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      expiresIn: null,
      userStatus: null,
      userRole: null,
      loginStatus: 'idle',
      sessionStatus: 'idle',
      loginError: null,
      traceId: null,
      login: async (payload) => {
        set({ loginStatus: 'loading', loginError: null, traceId: null });

        try {
          const currentToken = get().token;
          const guestToken =
            get().userRole === 'guest' && currentToken ? currentToken : undefined;
          const result = await postLogin({
            ...payload,
            guestToken,
          });
          set({
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            userStatus: result.userStatus,
            userRole: result.userRole,
            loginStatus: 'success',
            sessionStatus: 'ready',
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
      ensureGuestSession: async () => {
        if (get().token || get().sessionStatus === 'loading') {
          return;
        }

        set({ sessionStatus: 'loading' });
        try {
          const result = await postGuestSession();
          set({
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            userStatus: result.userStatus,
            userRole: result.userRole,
            sessionStatus: 'ready',
            loginError: null,
          });
        } catch {
          set({ sessionStatus: 'error' });
        }
      },
      clearLoginError: () =>
        set({
          loginError: null,
          traceId: null,
          loginStatus: 'idle',
        }),
      setUserStatus: (userStatus) =>
        set({
          userStatus,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          expiresIn: null,
          userStatus: null,
          userRole: null,
          loginStatus: 'idle',
          sessionStatus: 'idle',
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
        userStatus: state.userStatus,
        userRole: state.userRole,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.sessionStatus = state.token ? 'ready' : 'idle';
      },
    },
  ),
);
