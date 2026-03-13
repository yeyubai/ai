'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { postSleepCheckin } from '../../api/checkins.api';
import { CheckinFormLayout } from '../components/checkin-form-layout';
import {
  getMinBackfillDate,
  getRateLimitMessage,
  getTodayDateString,
  mapCheckinErrorMessage,
} from './checkin-utils';

function toIsoWithTimezone(input: string): string {
  return new Date(input).toISOString();
}

export function SleepCheckinSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const today = useMemo(() => getTodayDateString(), []);
  const minDate = useMemo(() => getMinBackfillDate(today), [today]);

  const [checkinDate, setCheckinDate] = useState(today);
  const [isBackfill, setIsBackfill] = useState(false);
  const [sleepAt, setSleepAt] = useState(`${today}T23:00`);
  const [wakeAt, setWakeAt] = useState(`${today}T07:00`);
  const [durationMin, setDurationMin] = useState('480');
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
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 1440) {
      setSubmitError('睡眠时长需在 1-1440 分钟之间。');
      return;
    }

    if (!sleepAt || !wakeAt || new Date(wakeAt) <= new Date(sleepAt)) {
      setSubmitError('起床时间必须晚于入睡时间。');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postSleepCheckin({
        checkinDate,
        sleepAt: toIsoWithTimezone(sleepAt),
        wakeAt: toIsoWithTimezone(wakeAt),
        durationMin: parsedDuration,
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
      title="睡眠打卡"
      description="记录睡眠时间段与时长，支持补录。"
      isBackfill={isBackfill}
      checkinDate={checkinDate}
      minDate={minDate}
      maxDate={today}
      isSubmitting={isSubmitting}
      submitLabel="提交睡眠记录"
      submitError={submitError}
      successMessage={successMessage}
      traceId={traceId}
      onBackfillChange={handleBackfillChange}
      onCheckinDateChange={setCheckinDate}
      onSubmit={handleSubmit}
    >
      <label className="block text-sm text-slate-700">
        入睡时间
        <input
          type="datetime-local"
          value={sleepAt}
          onChange={(event) => setSleepAt(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block text-sm text-slate-700">
        起床时间
        <input
          type="datetime-local"
          value={wakeAt}
          onChange={(event) => setWakeAt(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block text-sm text-slate-700">
        睡眠时长（分钟）
        <input
          value={durationMin}
          onChange={(event) => setDurationMin(event.target.value.trim())}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </CheckinFormLayout>
  );
}
