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
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { postMealCheckin } from '../../api/checkins.api';
import { CheckinFeedPanel } from '../components/checkin-feed-panel';
import { CheckinFormLayout } from '../components/checkin-form-layout';
import {
  getMinBackfillDate,
  getRateLimitMessage,
  getTodayDateString,
  mapCheckinErrorMessage,
} from './checkin-utils';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function MealCheckinSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const today = useMemo(() => getTodayDateString(), []);
  const minDate = useMemo(() => getMinBackfillDate(today), [today]);

  const [checkinDate, setCheckinDate] = useState(today);
  const [isBackfill, setIsBackfill] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [description, setDescription] = useState('鸡胸肉沙拉');
  const [estimatedKcal, setEstimatedKcal] = useState('520');
  const [imageUrl, setImageUrl] = useState('');
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

    if (!description.trim()) {
      setSubmitError('请输入饮食描述。');
      return;
    }

    const parsedKcal = Number(estimatedKcal);
    const kcal =
      estimatedKcal.trim().length === 0
        ? undefined
        : Number.isFinite(parsedKcal) && parsedKcal >= 0 && parsedKcal <= 5000
          ? parsedKcal
          : null;

    if (kcal === null) {
      setSubmitError('热量需在 0-5000 之间。');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postMealCheckin({
        checkinDate,
        mealType,
        description: description.trim(),
        estimatedKcal: kcal,
        imageUrl: imageUrl.trim() || undefined,
        isBackfill,
      });
      setSuccessMessage(`饮食已记录，可在辅助记录里继续查看。记录号：${result.submissionId}`);
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
      title="辅助饮食记录"
      description="饮食信息还可以继续记录，但这一版不会影响你今天先做什么。"
      isBackfill={isBackfill}
      checkinDate={checkinDate}
      minDate={minDate}
      maxDate={today}
      isSubmitting={isSubmitting}
      submitLabel="提交饮食记录"
      submitError={submitError}
      successMessage={successMessage}
      traceId={traceId}
      onBackfillChange={handleBackfillChange}
      onCheckinDateChange={setCheckinDate}
      onSubmit={handleSubmit}
      afterForm={<CheckinFeedPanel type="meal" />}
    >
      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label>餐次</Label>
          <Select
            value={mealType}
            onValueChange={(value) => setMealType((value as MealType) ?? 'lunch')}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择餐次" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">早餐</SelectItem>
              <SelectItem value="lunch">午餐</SelectItem>
              <SelectItem value="dinner">晚餐</SelectItem>
              <SelectItem value="snack">加餐</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="meal-description">饮食描述</Label>
          <Textarea
            id="meal-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="meal-kcal">估算热量（可选）</Label>
          <Input
            id="meal-kcal"
            value={estimatedKcal}
            onChange={(event) => setEstimatedKcal(event.target.value.trim())}
            inputMode="numeric"
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-background/75 p-3.5">
        <div className="space-y-2">
          <Label htmlFor="meal-image-url">图片链接（可选）</Label>
          <Input
            id="meal-image-url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
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
