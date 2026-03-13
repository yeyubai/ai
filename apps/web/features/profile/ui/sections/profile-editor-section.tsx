'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { fetchProfile, putProfile } from '../../api/profile.api';
import { ProfileFormCard, type ProfileFormErrors, type ProfileFormValues } from '../components/profile-form-card';

type Props = {
  mode: 'onboarding' | 'settings';
};

const defaultValues: ProfileFormValues = {
  heightCm: '',
  currentWeightKg: '',
  targetWeightKg: '',
};

const emptyErrors: ProfileFormErrors = {
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
};

type ParsedPayload = {
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
};

function formatNumber(value: number | null): string {
  if (value === null) {
    return '';
  }

  return String(value);
}

function parseAndValidate(values: ProfileFormValues): {
  errors: ProfileFormErrors;
  payload: ParsedPayload | null;
} {
  const heightCm = Number(values.heightCm);
  const currentWeightKg = Number(values.currentWeightKg);
  const targetWeightKg = Number(values.targetWeightKg);

  const errors: ProfileFormErrors = {
    heightCm:
      Number.isFinite(heightCm) && Number.isInteger(heightCm) && heightCm >= 120 && heightCm <= 220
        ? null
        : '身高需为 120-220 的整数',
    currentWeightKg:
      Number.isFinite(currentWeightKg) && currentWeightKg >= 30 && currentWeightKg <= 250
        ? null
        : '当前体重需在 30-250kg 之间',
    targetWeightKg:
      Number.isFinite(targetWeightKg) && targetWeightKg >= 30 && targetWeightKg <= 250
        ? null
        : '目标体重需在 30-250kg 之间',
  };

  if (!errors.currentWeightKg && !errors.targetWeightKg && targetWeightKg > currentWeightKg) {
    errors.targetWeightKg = '目标体重需小于或等于当前体重';
  }

  if (errors.heightCm || errors.currentWeightKg || errors.targetWeightKg) {
    return {
      errors,
      payload: null,
    };
  }

  return {
    errors,
    payload: {
      heightCm,
      currentWeightKg,
      targetWeightKg,
    },
  };
}

function mapSubmitError(code: string | number): string {
  if (code === 'INVALID_PARAMS') {
    return '提交参数不合法，请检查后重试。';
  }

  if (code === 'AUTH_EXPIRED') {
    return '登录状态已失效，请重新登录。';
  }

  return '保存失败，请稍后重试。';
}

export function ProfileEditorSection({ mode }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [phone, setPhone] = useState<string | null>(null);
  const [values, setValues] = useState<ProfileFormValues>(defaultValues);
  const [errors, setErrors] = useState<ProfileFormErrors>(emptyErrors);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!accessToken) {
        router.replace('/auth/login');
        return;
      }

      setIsLoading(true);
      setSubmitError(null);
      setTraceId(null);

      try {
        const profile = await fetchProfile(accessToken);
        if (!active) {
          return;
        }

        if (mode === 'onboarding' && profile.profileCompleted) {
          router.replace('/dashboard');
          return;
        }

        if (mode === 'settings' && !profile.profileCompleted) {
          router.replace('/onboarding/profile');
          return;
        }

        setPhone(profile.phone);
        setValues({
          heightCm: formatNumber(profile.heightCm),
          currentWeightKg: formatNumber(profile.currentWeightKg),
          targetWeightKg: formatNumber(profile.targetWeightKg),
        });
      } catch (error) {
        if (!active) {
          return;
        }

        if (isApiError(error) && error.status === 401) {
          logout();
          router.replace('/auth/login');
          return;
        }

        setSubmitError(isApiError(error) ? mapSubmitError(error.code) : '档案加载失败，请稍后重试。');
        setTraceId(isApiError(error) ? error.traceId ?? null : null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [accessToken, logout, mode, router]);

  const handleChange = (field: keyof ProfileFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value.trim(),
    }));
    setErrors((current) => ({
      ...current,
      [field]: null,
    }));
    setSubmitError(null);
    setTraceId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      router.replace('/auth/login');
      return;
    }

    const parsed = parseAndValidate(values);
    setErrors(parsed.errors);
    setSuccessMessage(null);
    if (!parsed.payload) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setTraceId(null);

    try {
      const profile = await putProfile(parsed.payload, accessToken);
      setPhone(profile.phone);
      setValues({
        heightCm: formatNumber(profile.heightCm),
        currentWeightKg: formatNumber(profile.currentWeightKg),
        targetWeightKg: formatNumber(profile.targetWeightKg),
      });

      if (mode === 'onboarding') {
        router.replace('/dashboard');
        return;
      }

      setSuccessMessage('档案已更新。');
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      setSubmitError(isApiError(error) ? mapSubmitError(error.code) : '保存失败，请稍后重试。');
      setTraceId(isApiError(error) ? error.traceId ?? null : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileFormCard
      mode={mode}
      phone={phone}
      values={values}
      errors={errors}
      submitError={submitError}
      successMessage={successMessage}
      traceId={traceId}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
