'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { postWeightCheckin } from '../../api/checkins.api';
import { CheckinFeedPanel } from '../components/checkin-feed-panel';
import { CheckinFormLayout } from '../components/checkin-form-layout';
import {
  getMinBackfillDate,
  getRateLimitMessage,
  getTodayDateString,
  mapCheckinErrorMessage,
} from './checkin-utils';

export function WeightCheckinSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const today = useMemo(() => getTodayDateString(), []);
  const minDate = useMemo(() => getMinBackfillDate(today), [today]);

  const [checkinDate, setCheckinDate] = useState(today);
  const [isBackfill, setIsBackfill] = useState(false);
  const [weightKg, setWeightKg] = useState('70');
  const [source, setSource] = useState<'manual' | 'smart_scale'>('manual');
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
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      router.replace('/dashboard');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [router, successMessage]);

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

    const parsedWeight = Number(weightKg);
    if (!Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 250) {
      setSubmitError('体重需在 30-250kg 之间。');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postWeightCheckin({
        checkinDate,
        measuredAt: new Date().toISOString(),
        weightKg: parsedWeight,
        source,
        isBackfill,
      });
      setSuccessMessage(`体重已记录，首页今日状态会同步更新。即将返回首页继续下一步。记录号：${result.submissionId}`);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      if (isApiError(error) && error.code === 'CHECKIN_RATE_LIMIT') {
        setCooldownSeconds(30);
      }

      setSubmitError(
        mapCheckinErrorMessage(error, '当日体重记录已达上限（最多 1 条）。'),
      );
      setTraceId(isApiError(error) ? error.traceId ?? null : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckinFormLayout
      title="体重打卡"
      description="支持当天记录与近 7 天补录。"
      isBackfill={isBackfill}
      checkinDate={checkinDate}
      minDate={minDate}
      maxDate={today}
      isSubmitting={isSubmitting}
      submitLabel="提交体重记录"
      submitError={submitError}
      successMessage={successMessage}
      traceId={traceId}
      onBackfillChange={handleBackfillChange}
      onCheckinDateChange={setCheckinDate}
      onSubmit={handleSubmit}
      afterForm={<CheckinFeedPanel type="weight" />}
    >
      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="weight-kg">体重（kg）</Label>
          <Input
            id="weight-kg"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value.trim())}
            inputMode="decimal"
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label>来源</Label>
          <Select
            value={source}
            onValueChange={(value) => setSource((value as 'manual' | 'smart_scale') ?? 'manual')}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择来源" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">手动输入</SelectItem>
              <SelectItem value="smart_scale">智能体脂秤</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {cooldownSeconds > 0 ? (
        <Badge variant="outline" className="w-fit border-amber-300 text-amber-700">
          请等待 {cooldownSeconds}s 后再提交
        </Badge>
      ) : null}
    </CheckinFormLayout>
  );
}
