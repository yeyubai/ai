'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Footprints,
  LineChart,
  MoonStar,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { fetchHomeToday } from '../../api/home.api';
import type { HomeTodayResult } from '../../types/home.types';

function formatHomeDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Asia/Shanghai',
    }).format(new Date(`${value}T00:00:00+08:00`));
  } catch {
    return value;
  }
}

function formatWeight(value: number | null): string {
  return value === null ? '--' : `${value.toFixed(1)} kg`;
}

function formatWeeklyChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} kg`;
}

function resolveActionHref(actionId: string): string {
  if (actionId === 'weight_checkin') {
    return '/checkins/weight';
  }
  if (actionId === 'activity_complete') {
    return '/checkins/activity';
  }
  if (actionId === 'evening_review') {
    return '/coach/review';
  }
  return '/dashboard';
}

function resolveFollowUpHref(data: HomeTodayResult): string {
  if (data.followUp.type === 'review') {
    return '/coach/review';
  }
  if (data.followUp.type === 'trend') {
    return '/trend';
  }
  return '/dashboard';
}

export function HomeDashboardSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [data, setData] = useState<HomeTodayResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weightMission = useMemo(
    () => data?.dailyMission.find((item) => item.actionId === 'weight_checkin') ?? null,
    [data],
  );
  const activityMission = useMemo(
    () => data?.dailyMission.find((item) => item.actionId === 'activity_complete') ?? null,
    [data],
  );
  const reviewMission = useMemo(
    () => data?.dailyMission.find((item) => item.actionId === 'evening_review') ?? null,
    [data],
  );

  const load = async () => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchHomeToday());
    } catch (loadError) {
      setError('首页加载失败，请稍后重试。');
      if (
        typeof loadError === 'object' &&
        loadError !== null &&
        'status' in loadError &&
        (loadError as { status?: number }).status === 401
      ) {
        logout();
        router.replace('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-[300px] w-full rounded-[32px]" />
        <Skeleton className="h-[120px] w-full rounded-[32px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[220px] w-full rounded-[32px]" />
          <Skeleton className="h-[220px] w-full rounded-[32px]" />
        </div>
        <Skeleton className="h-[220px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? '首页暂时不可用。'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden border-white/60 bg-[linear-gradient(135deg,rgba(246,252,248,0.98),rgba(249,241,232,0.98))] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.42)]">
        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatHomeDate(data.date)}
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                data.recoveryMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
              )}
            >
              {data.recoveryMode ? '轻恢复日' : '正常推进中'}
            </Badge>
          </div>

          <div className="mt-6 max-w-3xl">
            <p className="text-sm font-medium tracking-wide text-slate-500">今日下一步</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {data.nextAction.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {data.recoveryMode
                ? '今天不用补回昨天的进度，先把体重和运动里的最关键一步做掉，把节奏找回来。'
                : '先完成今天最关键的一步，再让 AI 帮你把今天和明天接起来。'}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={resolveActionHref(data.nextAction.actionId)}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-w-[220px] justify-between rounded-2xl px-5 shadow-sm',
              )}
            >
              {data.nextAction.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/trend"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-2xl border-slate-300 bg-white/75 px-5 text-slate-700 hover:bg-white',
              )}
            >
              查看本周变化
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">当前体重</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatWeight(data.weightStatus.latestWeightKg)}</p>
            <p className="mt-1 text-sm text-slate-500">目标 {formatWeight(data.weightStatus.targetWeightKg)}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <LineChart className="h-4 w-4" />
              <span className="text-sm font-medium">本周变化</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatWeeklyChange(data.weightStatus.weeklyChangeKg)}</p>
            <p className="mt-1 text-sm text-slate-500">先看趋势，不放大单日波动</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">近 7 天运动</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{data.activityStatus.exerciseDays7d} 天</p>
            <p className="mt-1 text-sm text-slate-500">今天完成度 {data.completion.done}/{data.completion.total}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/92 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">体重记录</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {data.weightStatus.weighedToday ? '今天已完成体重记录' : '今天还没称重'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {data.weightStatus.weighedToday
                    ? '体重已经更新到今天状态，下一步优先去完成运动。'
                    : '先称一次体重，首页和 AI 才能知道今天该怎么推进。'}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Scale className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/checkins/weight"
                className={cn(buttonVariants({ size: 'sm' }), 'rounded-xl')}
              >
                {data.weightStatus.weighedToday ? '重新记录体重' : '去记录体重'}
              </Link>
              {weightMission ? (
                <span className="text-sm text-muted-foreground">建议时间 {weightMission.recommendedAt}</span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">运动记录</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {data.activityStatus.completedToday
                    ? `今天已完成 ${data.activityStatus.durationMin} 分钟运动`
                    : '今天还没完成运动记录'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {data.activityStatus.completedToday
                    ? `当前已记录 ${data.activityStatus.estimatedKcal} kcal，晚上复盘会根据这次运动继续调整。`
                    : `今天目标 ${data.activityStatus.targetDurationMin} 分钟，建议消耗 ${data.activityStatus.targetBurnKcal} kcal。`}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Footprints className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/checkins/activity"
                className={cn(buttonVariants({ size: 'sm' }), 'rounded-xl')}
              >
                {data.activityStatus.completedToday ? '更新运动记录' : '去记录运动'}
              </Link>
              {activityMission ? (
                <span className="text-sm text-muted-foreground">建议时间 {activityMission.recommendedAt}</span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      {data.responseCode === 'PLAN_FALLBACK_USED' ? (
        <Alert className="border-amber-200 bg-amber-50/90 text-amber-900">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="text-amber-900">
            当前已进入恢复模式：先恢复体重记录和一次轻运动，不要求你一次做满全部节奏。
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/70 bg-card/92">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">完成今天后，会怎么继续</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                首页只负责把今天和明天接起来，不再额外摆放割裂的说明块。
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
              <MoonStar className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">1. 先完成白天两步</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                先称重，再完成一次运动或记录今天的运动消耗。
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">2. 晚上 AI 帮你调整</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reviewMission?.status === 'done'
                  ? '今晚复盘已经完成，明天首页会据此更新建议。'
                  : '晚上花 1 分钟做复盘，AI 会根据体重和运动记录给出明天动作。'}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">3. 明天继续接着做</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                不用自己再排计划，明天首页会直接告诉你先做什么。
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={resolveFollowUpHref(data)}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}
            >
              {data.followUp.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted-foreground">{data.followUp.title}</span>
          </div>

          {data.membershipState.plan === 'coach_plus' ? (
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              你已开启更细的动作解释和恢复建议，复盘里会比基础版更具体。
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
