'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Download,
  Palette,
  Target,
  UserRound,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchTodaySummary } from '@/features/weight-diary/api/weights.api';
import type { WeightTodaySummary } from '@/features/weight-diary/types/weight-diary.types';
import {
  fetchGoal,
  fetchProfile,
  fetchSettings,
  requestExport,
} from '../../api/me.api';
import type { UserProfile, UserSettings, WeightGoal } from '../../types/settings.types';

function SummaryLinkCard({
  href,
  icon,
  title,
  description,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="glass-card border-none transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{title}</p>
              <span className="text-sm font-medium text-slate-400">{value}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </CardContent>
      </Card>
    </Link>
  );
}

export function MeSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [summary, setSummary] = useState<WeightTodaySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [nextProfile, nextGoal, nextSettings, nextSummary] = await Promise.all([
          fetchProfile(),
          fetchGoal(),
          fetchSettings(),
          fetchTodaySummary(),
        ]);
        if (!active) {
          return;
        }
        setProfile(nextProfile);
        setGoal(nextGoal);
        setSettings(nextSettings);
        setSummary(nextSummary);
      } catch {
        if (!active) {
          return;
        }
        setError('我的页面加载失败，请稍后重试。');
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

  const handleExport = async () => {
    try {
      const task = await requestExport();
      setMessage(task.message);
      setError(null);
    } catch {
      setError('创建导出任务失败，请稍后重试。');
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-[180px] rounded-[30px]" />
        <Skeleton className="h-[104px] rounded-[30px]" />
        <Skeleton className="h-[104px] rounded-[30px]" />
      </div>
    );
  }

  if (!profile || !goal || !settings || !summary) {
    return (
      <div className="app-page">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '我的页面暂时不可用。'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="app-page space-y-4">
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

      <Card className="glass-card overflow-hidden border-none">
        <CardContent className="bg-[linear-gradient(135deg,rgba(255,249,220,0.5),rgba(214,234,248,0.6))] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-700/70 text-slate-700">
              <UserRound className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">我的</p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-950">
                {profile.nickname?.trim() || (userRole === 'guest' ? '游客' : '体重用户')}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {userRole === 'guest'
                  ? '当前为游客模式，登录后会把本机记录同步到正式账号。'
                  : '在这里管理个人资料、目标、日记主题和导出能力。'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-4xl font-semibold">{summary.recordDays}</p>
              <p className="mt-2 text-sm text-slate-500">记录天数</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{summary.bodyFatPct?.toFixed(1) ?? '--'}</p>
              <p className="mt-2 text-sm text-slate-500">体脂</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{summary.deltaFromStart?.toFixed(2) ?? '--'}</p>
              <p className="mt-2 text-sm text-slate-500">体重变化</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SummaryLinkCard
          href="/me/profile"
          icon={<UserRound className="h-5 w-5" />}
          title="个人资料"
          value={profile.heightCm ? `${profile.heightCm} cm` : '待完善'}
          description={profile.nickname?.trim() || '补齐昵称、身高等基础信息。'}
        />
        <SummaryLinkCard
          href="/me/goal"
          icon={<Target className="h-5 w-5" />}
          title="目标与体重"
          value={
            goal.startWeightKg && goal.targetWeightKg
              ? `${goal.startWeightKg.toFixed(1)} → ${goal.targetWeightKg.toFixed(1)}`
              : '待完善'
          }
          description="查看当前体重、目标体重和单位设置。"
        />
        <SummaryLinkCard
          href="/me/preferences"
          icon={<Palette className="h-5 w-5" />}
          title="日记与皮肤"
          value={settings.diaryName}
          description="调整日记名称和页面主题。"
        />
      </div>

      <Card className="glass-card border-none">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-900">导出与账号</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            导出能力当前保留任务入口。登录账号后，也可以在这里同步游客数据或退出登录。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void handleExport()} className="rounded-2xl">
              创建导出任务
            </Button>
            {userRole === 'guest' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.assign('/auth/login')}
                className="rounded-2xl"
              >
                登录并同步游客数据
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => logout()} className="rounded-2xl">
                退出登录
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
