'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProfile } from '@/features/profile/api/profile.api';
import { isApiError } from '@/lib/api/types';
import { useAuthStore } from '../../model/auth.store';
import { LoginFormCard } from '../components/login-form-card';

type FieldErrors = {
  phone: string | null;
  code: string | null;
};

function validateFields(phone: string, code: string): FieldErrors {
  const phoneError = /^1\d{10}$/.test(phone) ? null : '请输入 11 位大陆手机号';
  const codeError = /^\d{6}$/.test(code) ? null : '请输入 6 位数字验证码';
  return { phone: phoneError, code: codeError };
}

export function LoginPageSection() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  const loginError = useAuthStore((state) => state.loginError);
  const traceId = useAuthStore((state) => state.traceId);
  const accessToken = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const clearLoginError = useAuthStore((state) => state.clearLoginError);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncTraceId, setSyncTraceId] = useState<string | null>(null);

  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('123456');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    phone: null,
    code: null,
  });

  const isSubmitting = loginStatus === 'loading';
  const hasFieldError = useMemo(
    () => fieldErrors.phone !== null || fieldErrors.code !== null,
    [fieldErrors],
  );

  const routeAfterLogin = useCallback(
    async (token: string) => {
      try {
        const profile = await fetchProfile(token);
        if (profile.profileCompleted) {
          router.replace('/dashboard');
          return;
        }
        router.replace('/onboarding/profile');
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          logout();
          router.replace('/auth/login');
          return;
        }

        setSyncError('登录成功，但档案读取失败，请稍后重试。');
        setSyncTraceId(isApiError(error) ? error.traceId ?? null : null);
      }
    },
    [logout, router],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void routeAfterLogin(accessToken);
  }, [accessToken, routeAfterLogin]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSyncError(null);
    setSyncTraceId(null);

    const nextErrors = validateFields(phone, code);
    setFieldErrors(nextErrors);
    if (nextErrors.phone || nextErrors.code) {
      return;
    }

    const isSuccess = await login({ phone, code });
    if (!isSuccess) {
      return;
    }

    const latestToken = useAuthStore.getState().token;
    if (!latestToken) {
      setSyncError('登录成功，但未读取到登录态，请重试。');
      return;
    }

    await routeAfterLogin(latestToken);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.trim());
    setSyncError(null);
    setSyncTraceId(null);
    if (fieldErrors.phone || loginError) {
      setFieldErrors((current) => ({ ...current, phone: null }));
      clearLoginError();
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.trim());
    setSyncError(null);
    setSyncTraceId(null);
    if (fieldErrors.code || loginError) {
      setFieldErrors((current) => ({ ...current, code: null }));
      clearLoginError();
    }
  };

  return (
    <div className="w-full">
      <LoginFormCard
        phone={phone}
        code={code}
        phoneError={fieldErrors.phone}
        codeError={fieldErrors.code}
        submitError={hasFieldError ? null : syncError ?? loginError}
        traceId={syncTraceId ?? traceId}
        isSubmitting={isSubmitting}
        onPhoneChange={handlePhoneChange}
        onCodeChange={handleCodeChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
