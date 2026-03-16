'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Target, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import {
  fetchGoal,
  fetchProfile,
  updateGoal,
  updateProfile,
} from '../../api/me.api';
import { useMeFormDraftStore } from '../../model/me-form-draft.store';
import type { WeightGoal } from '../../types/settings.types';
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

export function MeProfileSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const userRole = useAuthStore((state) => state.userRole);
  const profile = useMeFormDraftStore((state) => state.profileDraft);
  const goal = useMeFormDraftStore((state) => state.goalDraft);
  const hydrateProfileDraft = useMeFormDraftStore((state) => state.hydrateProfileDraft);
  const hydrateGoalDraft = useMeFormDraftStore((state) => state.hydrateGoalDraft);
  const updateProfileDraft = useMeFormDraftStore((state) => state.updateProfileDraft);
  const updateGoalDraft = useMeFormDraftStore((state) => state.updateGoalDraft);
  const markProfileSaved = useMeFormDraftStore((state) => state.markProfileSaved);
  const markGoalSaved = useMeFormDraftStore((state) => state.markGoalSaved);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const [nextProfile, nextGoal] = await Promise.all([
          fetchProfile(),
          fetchGoal(),
        ]);

        if (!active) {
          return;
        }

        hydrateProfileDraft(nextProfile);
        hydrateGoalDraft(nextGoal);
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

  const handleWeightUnitChange = (value: WeightGoal['weightUnit'] | null) => {
    if (!value) {
      return;
    }

    updateGoalDraft((current) => ({
      ...current,
      weightUnit: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !goal) {
      return;
    }

    if (!goal.startWeightKg || !goal.targetWeightKg) {
      setError('请先补齐当前体重和目标体重。');
      return;
    }

    try {
      setIsSubmitting(true);

      const [nextProfile, nextGoal] = await Promise.all([
        updateProfile({
          nickname: profile.nickname ?? undefined,
          heightCm: profile.heightCm ?? undefined,
          sex: profile.sex ?? undefined,
          birthDate: profile.birthDate ?? undefined,
          avatarUrl: profile.avatarUrl ?? undefined,
        }),
        updateGoal({
          startWeightKg: goal.startWeightKg,
          targetWeightKg: goal.targetWeightKg,
          targetDate: goal.targetDate ?? undefined,
          weightUnit: goal.weightUnit,
        }),
      ]);

      markProfileSaved(nextProfile);
      markGoalSaved(nextGoal);
      setMessage('资料与目标已保存。');
      setError(null);
    } catch {
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
      <MeDetailShell title="资料与目标" description="把基础资料和体重目标放到一起维护。">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '资料页暂时不可用。'}</AlertDescription>
        </Alert>
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="资料与目标" description="基础资料和目标放在一起，改完一次保存就好。">
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
                <WheelNumberField field="goal-start-weight" value={goal.startWeightKg} />
              </div>
              <div className="space-y-2">
                <Label>目标体重</Label>
                <WheelNumberField field="goal-target-weight" value={goal.targetWeightKg} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>单位</Label>
              <Select value={goal.weightUnit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">公斤</SelectItem>
                  <SelectItem value="lb">磅</SelectItem>
                </SelectContent>
              </Select>
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
