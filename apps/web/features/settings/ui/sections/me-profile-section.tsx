'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Target, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import {
  fetchGoal,
  fetchProfile,
  updateGoal,
  updateProfile,
} from '../../api/me.api';
import { useMeFormDraftStore } from '../../model/me-form-draft.store';
import { MeDetailShell } from '../components/me-detail-shell';
import { WheelNumberField } from '../components/wheel-number-field';

function getAccountLabel(userRole: 'guest' | 'member' | null): string {
  if (userRole === 'guest') {
    return '游客账号';
  }

  if (userRole === 'member') {
    return '正式账号';
  }

  return '未知';
}

function getSaveErrorMessage(prefix: string, error: unknown): string {
  const detail = isApiError(error) ? error.message : '请稍后重试。';
  return `${prefix}保存失败：${detail}`;
}

export function MeProfileSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const userRole = useAuthStore((state) => state.userRole);
  const profile = useMeFormDraftStore((state) => state.profileDraft);
  const goal = useMeFormDraftStore((state) => state.goalDraft);
  const ensureDraftOwner = useMeFormDraftStore((state) => state.ensureDraftOwner);
  const hydrateProfileDraft = useMeFormDraftStore((state) => state.hydrateProfileDraft);
  const hydrateGoalDraft = useMeFormDraftStore((state) => state.hydrateGoalDraft);
  const updateProfileDraft = useMeFormDraftStore((state) => state.updateProfileDraft);
  const markProfileSaved = useMeFormDraftStore((state) => state.markProfileSaved);
  const markGoalSaved = useMeFormDraftStore((state) => state.markGoalSaved);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStatus !== 'ready') {
      return;
    }

    ensureDraftOwner(token);
  }, [ensureDraftOwner, sessionStatus, token]);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setError(null);
        setMessage(null);
        setIsLoading(true);

        const [nextProfile, nextGoal] = await Promise.all([
          fetchProfile(),
          fetchGoal(),
        ]);

        if (!active) {
          return;
        }

        hydrateProfileDraft(nextProfile);
        hydrateGoalDraft({
          ...nextGoal,
          weightUnit: 'kg',
        });
      } catch {
        if (active) {
          setError('资料页加载失败，请稍后重试。');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [hydrateGoalDraft, hydrateProfileDraft, sessionStatus, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !goal) {
      return;
    }

    if (goal.startWeightKg === null || goal.targetWeightKg === null) {
      setMessage(null);
      setError('请先补齐当前体重和目标体重。');
      return;
    }

    const profilePayload = {
      nickname: profile.nickname ?? undefined,
      heightCm: profile.heightCm ?? undefined,
      sex: profile.sex ?? undefined,
      birthDate: profile.birthDate ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
    };
    const goalPayload = {
      startWeightKg: goal.startWeightKg,
      targetWeightKg: goal.targetWeightKg,
      targetDate: goal.targetDate ?? undefined,
      weightUnit: 'kg' as const,
    };

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const [profileResult, goalResult] = await Promise.allSettled([
        updateProfile(profilePayload),
        updateGoal(goalPayload),
      ]);

      const successMessages: string[] = [];
      const errorMessages: string[] = [];

      if (profileResult.status === 'fulfilled') {
        markProfileSaved(profileResult.value);
        successMessages.push('基础资料已保存');
      } else {
        errorMessages.push(getSaveErrorMessage('基础资料', profileResult.reason));
      }

      if (goalResult.status === 'fulfilled') {
        markGoalSaved({
          ...goalResult.value,
          weightUnit: 'kg',
        });
        successMessages.push('体重目标已保存');
      } else {
        errorMessages.push(getSaveErrorMessage('体重目标', goalResult.reason));
      }

      if (successMessages.length === 2) {
        setMessage('资料与目标已保存。');
        setError(null);
        return;
      }

      setMessage(
        successMessages.length > 0 ? `${successMessages.join('；')}。` : null,
      );
      setError(errorMessages.length > 0 ? errorMessages.join('；') : null);
    } catch {
      setMessage(null);
      setError('保存失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[320px] rounded-[30px]" />
        <Skeleton className="h-[300px] rounded-[30px]" />
      </div>
    );
  }

  if (!profile || !goal) {
    return (
      <MeDetailShell title="资料与目标">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '资料页暂时不可用。'}</AlertDescription>
        </Alert>
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="资料与目标">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">基础资料</p>
                <p className="mt-1 text-[12px] text-slate-500">用于计算 BMI，也会影响趋势解读。</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>账号</Label>
                <Input value={getAccountLabel(userRole)} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>昵称</Label>
                <Input
                  value={profile.nickname ?? ''}
                  onChange={(event) =>
                    updateProfileDraft((current) => ({
                      ...current,
                      nickname: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>身高（cm）</Label>
                <WheelNumberField field="profile-height" value={profile.heightCm} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">体重目标</p>
                <p className="mt-1 text-[12px] text-slate-500">当前体重、目标体重和单位放在一起调整。</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>当前体重</Label>
                <WheelNumberField
                  field="goal-start-weight"
                  value={goal.startWeightKg}
                  weightUnit="kg"
                />
              </div>
              <div className="space-y-2">
                <Label>目标体重</Label>
                <WheelNumberField
                  field="goal-target-weight"
                  value={goal.targetWeightKg}
                  weightUnit="kg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>单位</Label>
              <Input value="公斤（kg）" readOnly className="bg-slate-50" />
              <p className="text-[12px] text-slate-500">
                当前版本统一按公斤记录，先避免不同页面之间的单位混用。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex">
          <Button type="submit" className="h-11 rounded-2xl px-6" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存本页设置'}
          </Button>
        </div>
      </form>
    </MeDetailShell>
  );
}
