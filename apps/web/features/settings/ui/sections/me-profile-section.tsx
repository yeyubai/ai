'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Scale, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchTodaySummary } from '@/features/weight-diary/api/weights.api';
import type { WeightTodaySummary } from '@/features/weight-diary/types/weight-diary.types';
import { fetchProfile, updateProfile } from '../../api/me.api';
import type { UserProfile } from '../../types/settings.types';
import { MeDetailShell } from '../components/me-detail-shell';

function formatWeight(value: number | null | undefined): string {
  return typeof value === 'number' ? `${value.toFixed(2)} kg` : '暂无记录';
}

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<WeightTodaySummary | null>(null);
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

        const [nextProfile, nextSummary] = await Promise.all([
          fetchProfile(),
          fetchTodaySummary(),
        ]);

        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setSummary(nextSummary);
      } catch {
        if (active) {
          setError('个人资料加载失败，请稍后重试。');
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
  }, [sessionStatus, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) {
      return;
    }

    try {
      setIsSubmitting(true);
      const nextProfile = await updateProfile({
        nickname: profile.nickname ?? undefined,
        heightCm: profile.heightCm ?? undefined,
        sex: profile.sex ?? undefined,
        birthDate: profile.birthDate ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
      });
      setProfile(nextProfile);
      setMessage('个人资料已保存。');
      setError(null);
    } catch {
      setError('保存个人资料失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[320px] rounded-[30px]" />
      </div>
    );
  }

  if (!profile || !summary) {
    return (
      <MeDetailShell title="个人资料" description="补齐你的基础信息。">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '个人资料暂时不可用。'}</AlertDescription>
        </Alert>
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="个人资料" description="补齐昵称、身高和基础资料。">
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

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">基础信息</p>
                <p className="mt-1 text-[12px] text-slate-500">这些信息会影响 BMI 等推导结果。</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>账号</Label>
                <Input value={getAccountLabel(userRole)} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>体重</Label>
                <div className="relative">
                  <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={formatWeight(summary.latestEntry?.weightKg)}
                    readOnly
                    className="bg-slate-50 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>昵称</Label>
                <Input
                  value={profile.nickname ?? ''}
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, nickname: event.target.value } : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>身高（cm）</Label>
                <Input
                  value={profile.heightCm ?? ''}
                  inputMode="numeric"
                  onChange={(event) =>
                    setProfile((current) =>
                      current
                        ? {
                            ...current,
                            heightCm: event.target.value ? Number(event.target.value) : null,
                          }
                        : current,
                    )
                  }
                />
              </div>
            </div>

            <Button type="submit" className="rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存个人资料'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </MeDetailShell>
  );
}
