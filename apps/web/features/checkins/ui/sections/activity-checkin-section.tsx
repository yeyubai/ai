'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { postActivityCheckin } from '../../api/checkins.api';
import { CheckinFeedPanel } from '../components/checkin-feed-panel';
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
  const [completed, setCompleted] = useState(true);
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
    if (completed && (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 600)) {
      setSubmitError('已完成运动时，时长需在 1-600 分钟之间。');
      return;
    }

    const parsedSteps = Number(steps);
    const safeSteps =
      !completed || steps.trim().length === 0
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
      !completed || estimatedKcal.trim().length === 0
        ? 0
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
        completed,
        activityType: completed ? activityType.trim() || undefined : undefined,
        durationMin: completed ? parsedDuration : 0,
        steps: safeSteps,
        estimatedKcal: completed ? safeKcal : 0,
        isBackfill,
      });
      setSuccessMessage(
        completed
          ? `运动已记录，首页和进度页会同步更新。记录号：${result.submissionId}`
          : `已记录今天暂未完成运动，今晚复盘会据此给你更轻的建议。记录号：${result.submissionId}`,
      );
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
      title="运动记录"
      description="先记录今天有没有完成运动，再补充时长和消耗。"
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
      afterForm={<CheckinFeedPanel type="activity" />}
    >
      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="activity-completed"
            checked={completed}
            onCheckedChange={(checked) => setCompleted(Boolean(checked))}
          />
          <div className="space-y-1">
            <Label htmlFor="activity-completed">今天已完成运动</Label>
            <p className="text-sm text-muted-foreground">
              如果今天还没动，也可以先记录下来，晚间 AI 会给你更轻的恢复建议。
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="activity-duration">时长（分钟）</Label>
          <Input
            id="activity-duration"
            value={completed ? durationMin : '0'}
            onChange={(event) => setDurationMin(event.target.value.trim())}
            inputMode="numeric"
            disabled={!completed}
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="activity-kcal">消耗热量（kcal）</Label>
          <Input
            id="activity-kcal"
            value={completed ? estimatedKcal : '0'}
            onChange={(event) => setEstimatedKcal(event.target.value.trim())}
            inputMode="numeric"
            disabled={!completed}
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="activity-type">活动类型（可选）</Label>
          <Input
            id="activity-type"
            value={activityType}
            onChange={(event) => setActivityType(event.target.value)}
            disabled={!completed}
            placeholder="walk / run / strength"
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="activity-steps">步数（可选）</Label>
          <Input
            id="activity-steps"
            value={completed ? steps : ''}
            onChange={(event) => setSteps(event.target.value.trim())}
            inputMode="numeric"
            disabled={!completed}
            className="bg-background"
          />
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
