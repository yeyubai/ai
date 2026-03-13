'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Sparkles } from 'lucide-react';
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
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      setError(isApiError(error) ? error.message : '初始化失败，请稍后重试。');
      setTraceId(isApiError(error) ? error.traceId ?? null : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">轻量评估</Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <Sparkles className="h-6 w-6 text-primary" />
          先帮你定下今天的第一步
        </CardTitle>
        <CardDescription>我们只问 6 个关键问题，用来定下目标体重、运动起点，以及你今天先做什么。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="heightCm">身高（cm）</Label>
            <Input id="heightCm" value={values.heightCm} onChange={(event) => handleChange('heightCm', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentWeightKg">当前体重（kg）</Label>
            <Input id="currentWeightKg" value={values.currentWeightKg} onChange={(event) => handleChange('currentWeightKg', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetWeightKg">目标体重（kg）</Label>
            <Input id="targetWeightKg" value={values.targetWeightKg} onChange={(event) => handleChange('targetWeightKg', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalWeeks">目标周期（周）</Label>
            <Input id="goalWeeks" value={values.goalWeeks} onChange={(event) => handleChange('goalWeeks', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>活动基线</Label>
            <Select
              value={values.activityBaseline}
              onValueChange={(value) => handleChange('activityBaseline', value ?? 'light')}
            >
              <SelectTrigger><SelectValue placeholder="选择活动基线" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">轻活动</SelectItem>
                <SelectItem value="medium">中等活动</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>失败模式</Label>
            <Select
              value={values.motivationPattern}
              onValueChange={(value) =>
                handleChange('motivationPattern', value ?? 'restart_after_break')
              }
            >
              <SelectTrigger><SelectValue placeholder="选择最像你的情况" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restart_after_break">经常中断后重来</SelectItem>
                <SelectItem value="late_night_overeat">容易晚间失控</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="workRestPattern">作息时间</Label>
            <Input id="workRestPattern" value={values.workRestPattern} onChange={(event) => handleChange('workRestPattern', event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="dietPreference">饮食偏好</Label>
            <Input id="dietPreference" value={values.dietPreference} onChange={(event) => handleChange('dietPreference', event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? '生成中...' : '开始今天'}
            </Button>
          </div>
        </form>

        {actions.length > 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
            <p className="text-sm font-semibold">你的首日建议</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {actions.map((action) => (
                <li key={action} className="rounded-lg bg-background/80 px-3 py-2">{action}</li>
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
