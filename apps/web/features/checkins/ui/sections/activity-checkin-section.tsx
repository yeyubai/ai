'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { postActivityCheckin } from '../../api/checkins.api';
import { CheckinFormLayout } from '../components/checkin-form-layout';
import {
  getMinBackfillDate,
  getRateLimitMessage,
  getTodayDateString,
  mapCheckinErrorMessage,
} from './checkin-utils';

export function ActivityCheckinSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const today = useMemo(() => getTodayDateString(), []);
  const minDate = useMemo(() => getMinBackfillDate(today), [today]);

  const [checkinDate, setCheckinDate] = useState(today);
  const [isBackfill, setIsBackfill] = useState(false);
  const [activityType, setActivityType] = useState('walk');
  const [durationMin, setDurationMin] = useState('40');
  const [steps, setSteps] = useState('6000');
  const [estimatedKcal, setEstimatedKcal] = useState('220');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router, token]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const handleBackfillChange = (value: boolean) => {
    setIsBackfill(value);
    if (!value) {
      setCheckinDate(today);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setTraceId(null);

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (cooldownSeconds > 0) {
      setSubmitError(getRateLimitMessage(cooldownSeconds));
      return;
    }

    const parsedDuration = Number(durationMin);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 600) {
      setSubmitError('运动时长需在 1-600 分钟之间。');
      return;
    }

    const parsedSteps = Number(steps);
    const safeSteps =
      steps.trim().length === 0
        ? undefined
        : Number.isInteger(parsedSteps) && parsedSteps >= 0 && parsedSteps <= 100000
          ? parsedSteps
          : null;
    if (safeSteps === null) {
      setSubmitError('步数需在 0-100000 之间。');
      return;
    }

    const parsedKcal = Number(estimatedKcal);
    const safeKcal =
      estimatedKcal.trim().length === 0
        ? undefined
        : Number.isInteger(parsedKcal) && parsedKcal >= 0 && parsedKcal <= 5000
          ? parsedKcal
          : null;
    if (safeKcal === null) {
      setSubmitError('热量需在 0-5000 之间。');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postActivityCheckin({
        checkinDate,
        activityType: activityType.trim(),
        durationMin: parsedDuration,
        steps: safeSteps,
        estimatedKcal: safeKcal,
        isBackfill,
      });
      setSuccessMessage(`记录成功：${result.submissionId}`);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      if (isApiError(error) && error.code === 'CHECKIN_RATE_LIMIT') {
        setCooldownSeconds(30);
      }

      setSubmitError(mapCheckinErrorMessage(error));
      setTraceId(isApiError(error) ? error.traceId ?? null : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckinFormLayout
      title="运动打卡"
      description="记录运动类型、时长与可选消耗指标。"
      isBackfill={isBackfill}
      checkinDate={checkinDate}
      minDate={minDate}
      maxDate={today}
      isSubmitting={isSubmitting}
      submitLabel="提交运动记录"
      submitError={submitError}
      successMessage={successMessage}
      traceId={traceId}
      onBackfillChange={handleBackfillChange}
      onCheckinDateChange={setCheckinDate}
      onSubmit={handleSubmit}
    >
      <label className="block text-sm text-slate-700">
        运动类型
        <input
          value={activityType}
          onChange={(event) => setActivityType(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block text-sm text-slate-700">
        时长（分钟）
        <input
          value={durationMin}
          onChange={(event) => setDurationMin(event.target.value.trim())}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block text-sm text-slate-700">
        步数（可选）
        <input
          value={steps}
          onChange={(event) => setSteps(event.target.value.trim())}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block text-sm text-slate-700">
        估算热量（可选）
        <input
          value={estimatedKcal}
          onChange={(event) => setEstimatedKcal(event.target.value.trim())}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </CheckinFormLayout>
  );
}
