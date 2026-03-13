'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { useAuthStore } from '../../model/auth.store';
import { LoginFormCard } from '../components/login-form-card';

function validateFields(phone: string, code: string) {
  return {
    phone: /^1\d{10}$/.test(phone) ? null : '请输入 11 位大陆手机号',
    code: /^\d{6}$/.test(code) ? null : '请输入 6 位数字验证码',
  };
}

export function LoginPageSection() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  const loginError = useAuthStore((state) => state.loginError);
  const traceId = useAuthStore((state) => state.traceId);
  const clearLoginError = useAuthStore((state) => state.clearLoginError);
  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('123456');
  const [fieldErrors, setFieldErrors] = useState({ phone: null as string | null, code: null as string | null });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateFields(phone, code);
    setFieldErrors(nextErrors);
    if (nextErrors.phone || nextErrors.code) {
      return;
    }

    const success = await login({ phone, code });
    if (!success) {
      return;
    }

    const { userStatus } = useAuthStore.getState();
    router.replace(userStatus === 'needs_onboarding' ? '/onboarding/profile' : '/dashboard');
  };

  return (
    <div className="flex w-full justify-center">
      <LoginFormCard
        phone={phone}
        code={code}
        phoneError={fieldErrors.phone}
        codeError={fieldErrors.code}
        submitError={loginError}
        traceId={traceId}
        isSubmitting={loginStatus === 'loading'}
        onPhoneChange={(value) => {
          setPhone(value.trim());
          clearLoginError();
          setFieldErrors((current) => ({ ...current, phone: null }));
        }}
        onCodeChange={(value) => {
          setCode(value.trim());
          clearLoginError();
          setFieldErrors((current) => ({ ...current, code: null }));
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
