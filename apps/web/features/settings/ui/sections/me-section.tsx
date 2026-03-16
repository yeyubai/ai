'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Download,
  Palette,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchTodaySummary } from '@/features/weight-diary/api/weights.api';
import type { WeightTodaySummary } from '@/features/weight-diary/types/weight-diary.types';
import { cn } from '@/lib/utils';
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

function MetricCell({
  label,
  value,
  unit,
  withDivider,
}: {
  label: string;
  value: string;
  unit?: string;
  withDivider?: boolean;
}) {
  return (
    <div className={cn('px-3', withDivider && 'border-l border-white/18 pl-5')}>
      <div className="flex items-end justify-center gap-2">
        <span className="text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">
          {value}
        </span>
        {unit ? <span className="pb-1 text-[12px] font-medium text-slate-500">{unit}</span> : null}
      </div>
      <p className="mt-2 whitespace-nowrap text-[12px] font-medium text-slate-600">{label}</p>
    </div>
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

  const displayName = profile.nickname?.trim() || (userRole === 'guest' ? '游客' : '体重用户');

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

      <Card className="overflow-hidden rounded-[30px] border border-white/55 bg-[linear-gradient(180deg,rgba(244,251,252,0.98),rgba(234,246,248,0.98))] shadow-[0_24px_60px_-34px_rgba(15,170,183,0.32)] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-cyan-900/55 bg-white/55 text-cyan-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <UserRound className="h-11 w-11" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-cyan-800/70">我的</p>
              <h1 className="mt-2 truncate text-[2.3rem] font-semibold leading-none text-slate-950">
                {displayName}
              </h1>
              <p className="mt-3 max-w-[18rem] text-[14px] leading-6 text-slate-600">
                {userRole === 'guest'
                  ? '当前以游客身份使用，登录后可同步本机记录与目标。'
                  : '在这里管理个人资料、目标设置与数据导出。'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/50 bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="grid grid-cols-[1.1fr_1.05fr_1.25fr] text-center">
              <MetricCell label="记录天数" value={`${summary.recordDays}`} />
              <MetricCell
                label="体脂"
                value={summary.bodyFatPct?.toFixed(1) ?? '--'}
                unit={summary.bodyFatPct === null ? undefined : '%'}
                withDivider
              />
              <MetricCell
                label="体重变化"
                value={summary.deltaFromStart?.toFixed(2) ?? '--'}
                unit={summary.deltaFromStart === null ? undefined : 'kg'}
                withDivider
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SummaryLinkCard
          href="/me/coach"
          icon={<Sparkles className="h-5 w-5" />}
          title="高级私教"
          value="图片分析"
          description="上传体型照，获得分析结果与后续追问建议。"
        />
        <SummaryLinkCard
          href="/me/profile"
          icon={<UserRound className="h-5 w-5" />}
          title="资料与目标"
          value={
            goal.targetWeightKg
              ? `目标 ${goal.targetWeightKg.toFixed(1)} kg`
              : '待完善'
          }
          description="集中维护昵称、身高与体重目标。"
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
            {userRole === 'guest'
              ? '可创建导出任务，并在登录后同步当前设备上的记录。'
              : '可创建导出任务，并管理当前账号状态。'}
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
