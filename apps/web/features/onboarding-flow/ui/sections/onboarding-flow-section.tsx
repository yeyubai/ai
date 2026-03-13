'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import {
  completeOnboarding,
  createAssessment,
  updateProfile,
} from '../../api/onboarding.api';
import type { OnboardingFormState } from '../../types/onboarding.types';

const defaultState: OnboardingFormState = {
  heightCm: '165',
  currentWeightKg: '68.2',
  targetWeightKg: '60',
  goalWeeks: '16',
  workRestPattern: '23:30-07:30',
  dietPreference: 'high-protein',
  activityBaseline: 'light',
  motivationPattern: 'restart_after_break',
};

export function OnboardingFlowSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [values, setValues] = useState<OnboardingFormState>(defaultState);
  const [actions, setActions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const handleChange = (field: keyof OnboardingFormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
    setTraceId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTraceId(null);

    try {
      await updateProfile({
        heightCm: Number(values.heightCm),
        currentWeightKg: Number(values.currentWeightKg),
        targetWeightKg: Number(values.targetWeightKg),
        goalWeeks: Number(values.goalWeeks),
        workRestPattern: values.workRestPattern,
        dietPreference: values.dietPreference,
        activityBaseline: values.activityBaseline,
        motivationPattern: values.motivationPattern,
      });
      const assessment = await createAssessment({
        goalWeeks: Number(values.goalWeeks),
        workRestPattern: values.workRestPattern,
        dietPreference: values.dietPreference,
        activityBaseline: values.activityBaseline,
        motivationPattern: values.motivationPattern,
      });
      setActions(assessment.recommendedDailyActions);
      const completed = await completeOnboarding();
      router.replace(completed.homeRedirect);
    } catch (nextError) {
      if (isApiError(nextError) && nextError.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      setError(isApiError(nextError) ? nextError.message : '初始化失败，请稍后重试。');
      setTraceId(isApiError(nextError) ? nextError.traceId ?? null : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">
          轻量评估
        </Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <Sparkles className="h-6 w-6 text-primary" />
          先定下今天最容易开始的一步
        </CardTitle>
        <CardDescription>
          先填写 4 个必要信息，其他节奏和偏好先用温和默认值兜底，等你开始后再慢慢完善。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 rounded-[28px] border border-border/70 bg-background/80 p-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">默认节奏</p>
            <p className="mt-2 text-sm font-medium text-foreground">先按常规作息开始</p>
            <p className="mt-1 text-sm text-muted-foreground">
              作息和偏好稍后再补，不阻断今天开始。
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">执行重点</p>
            <p className="mt-2 text-sm font-medium text-foreground">先围绕体重和运动</p>
            <p className="mt-1 text-sm text-muted-foreground">
              首页只会先给一个最关键动作，不会把你困在表单里。
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">后续可改</p>
            <p className="mt-2 text-sm font-medium text-foreground">身高先用默认值兜底</p>
            <p className="mt-1 text-sm text-muted-foreground">
              后续可以在“我的”里补充更完整的个人信息。
            </p>
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="currentWeightKg">当前体重（kg）</Label>
            <Input
              id="currentWeightKg"
              value={values.currentWeightKg}
              onChange={(event) => handleChange('currentWeightKg', event.target.value)}
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetWeightKg">目标体重（kg）</Label>
            <Input
              id="targetWeightKg"
              value={values.targetWeightKg}
              onChange={(event) => handleChange('targetWeightKg', event.target.value)}
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalWeeks">目标周期（周）</Label>
            <Input
              id="goalWeeks"
              value={values.goalWeeks}
              onChange={(event) => handleChange('goalWeeks', event.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label>活动基线</Label>
            <Select
              value={values.activityBaseline}
              onValueChange={(value) => handleChange('activityBaseline', value ?? 'light')}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择活动基线" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">轻活动</SelectItem>
                <SelectItem value="medium">中等活动</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 md:col-span-2">
            <p className="text-sm font-medium text-foreground">默认先帮你补上的信息</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              当前会先按 165 cm 身高、常规作息、高蛋白偏好和“容易中断后重来”的恢复模式生成首日节奏，后续都可以再调整。
            </p>
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              className="h-12 w-full justify-between rounded-2xl px-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? '生成今天的起步动作...' : '开始今天'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {actions.length > 0 ? (
          <div className="rounded-[28px] border border-border/70 bg-muted/55 p-4">
            <p className="text-sm font-semibold text-foreground">你的首日节奏</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {actions.map((action) => (
                <li
                  key={action}
                  className="flex items-center justify-between rounded-2xl bg-background/80 px-4 py-3"
                >
                  <span>{action}</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {traceId ? <p className="text-xs text-muted-foreground">traceId: {traceId}</p> : null}
      </CardContent>
    </Card>
  );
}
