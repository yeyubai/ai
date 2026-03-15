'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Flame,
  Footprints,
  LineChart,
  MoonStar,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

function getDirectionSummary(data: HomeTodayResult): string {
  const weeklyChange = data.weightStatus.weeklyChangeKg;
  const exerciseDays = data.activityStatus.exerciseDays7d;

  if (weeklyChange < 0 && exerciseDays >= 3) {
    return `过去 7 天体重变化 ${formatWeeklyChange(weeklyChange)}，运动完成 ${exerciseDays} 天，方向是对的，继续稳住连续性。`;
  }

  if (exerciseDays >= 3) {
    return `过去 7 天体重变化 ${formatWeeklyChange(weeklyChange)}，运动完成 ${exerciseDays} 天，节奏已经建立，接下来更看重连续记录。`;
  }

  return `过去 7 天体重变化 ${formatWeeklyChange(weeklyChange)}，运动完成 ${exerciseDays} 天，方向还在建立中，先把今天这一步做掉。`;
}

function getMilestoneLabel(data: HomeTodayResult): string {
  if (data.activityStatus.exerciseDays7d >= 5) {
    return '本周运动 5 天，节奏已经很稳';
  }
  if (data.activityStatus.exerciseDays7d >= 3) {
    return '本周运动达到 3 天，已经跨过起步门槛';
  }
  if (data.weightStatus.weighedToday) {
    return '今天体重已记录，先把第二步接上';
  }
  return '先拿下今天的第一条记录';
}

function PrimaryActionCard({ data }: { data: HomeTodayResult }) {
  if (data.nextAction.actionId === 'weight_checkin') {
    return (
      <Card className="border-border/70 bg-card/92 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">现在先做这一步</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">先称一次体重，确定今天的起点</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                {data.weightStatus.weighedToday
                  ? '体重已经更新，首页接下来会把重点切到运动。'
                  : '先完成这一步，首页和今晚的调整才知道今天该怎么推进。'}
              </p>
            </div>
            <div className="rounded-3xl bg-primary/10 p-3 text-primary">
              <Scale className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">当前体重</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatWeight(data.weightStatus.latestWeightKg)}</p>
              <p className="mt-1 text-sm text-muted-foreground">目标 {formatWeight(data.weightStatus.targetWeightKg)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">本周趋势</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatWeeklyChange(data.weightStatus.weeklyChangeKg)}</p>
              <p className="mt-1 text-sm text-muted-foreground">先看方向，不放大单日波动</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.nextAction.actionId === 'activity_complete') {
    return (
      <Card className="border-border/70 bg-card/92 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">现在先做这一步</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">把今天的运动接上，先完成一次记录</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                {data.activityStatus.completedToday
                  ? '今天的运动已经完成，晚上复盘会接着帮你安排明天。'
                  : `今天目标 ${data.activityStatus.targetDurationMin} 分钟，建议消耗 ${data.activityStatus.targetBurnKcal} kcal。`}
              </p>
            </div>
            <div className="rounded-3xl bg-primary/10 p-3 text-primary">
              <Footprints className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">本周运动</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.activityStatus.exerciseDays7d} 天</p>
              <p className="mt-1 text-sm text-muted-foreground">这周越稳，趋势越容易往目标方向走</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">今天完成度</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {data.completion.done}/{data.completion.total}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">先把今天的第二步做掉，晚上再看调整</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/92 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
              <p className="text-sm font-medium text-slate-500">现在先做这一步</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">晚上做 1 分钟调整，把明天接起来</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              白天的动作已经有结果了，现在只需要把今天收住，明天首页就会直接告诉你先做什么。
            </p>
          </div>
          <div className="rounded-3xl bg-primary/10 p-3 text-primary">
            <MoonStar className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">今天完成</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {data.completion.done}/{data.completion.total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">先回看今天，再给明天留一个容易开始的动作</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">恢复策略</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {data.recoveryMode ? '轻恢复模式' : '正常推进'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.recoveryMode ? '今晚先用更轻的节奏把连续性找回来' : '今晚重点是把明天的门槛继续压低'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecondaryCard({ data }: { data: HomeTodayResult }) {
  const isWeightPrimary = data.nextAction.actionId === 'weight_checkin';
  const title = isWeightPrimary ? '运动记录' : '体重记录';
  const heading = isWeightPrimary
    ? data.activityStatus.completedToday
      ? `今天已完成 ${data.activityStatus.durationMin} 分钟运动`
      : '运动还没接上，先完成一次记录'
    : data.weightStatus.weighedToday
      ? '体重已经记录，今天的起点已明确'
      : '体重还没记录，越早完成越容易进入节奏';
  const body = isWeightPrimary
    ? data.activityStatus.completedToday
      ? `已记录 ${data.activityStatus.estimatedKcal} kcal，今晚复盘会直接接这次运动结果。`
      : `今天目标 ${data.activityStatus.targetDurationMin} 分钟，先做一段轻运动也算继续。`
    : data.weightStatus.weighedToday
      ? `当前体重 ${formatWeight(data.weightStatus.latestWeightKg)}，目标 ${formatWeight(data.weightStatus.targetWeightKg)}。`
      : '哪怕只是先称一次体重，也是在把今天的节奏接回来。';
  const href = isWeightPrimary ? '/checkins/activity' : '/checkins/weight';

  return (
    <Card className="border-border/70 bg-card/92">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{heading}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            {isWeightPrimary ? <Footprints className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={href} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}>
            去补上这一步
          </Link>
          <span className="text-sm text-muted-foreground">这一步可以稍后补上，不会影响你现在先做眼前这件事。</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeDashboardSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [data, setData] = useState<HomeTodayResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchHomeToday();
        if (!active) {
          return;
        }
        setData(result);
      } catch (loadError) {
        if (!active) {
          return;
        }
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
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [logout, router, token]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[320px] w-full rounded-[32px]" />
          <div className="grid gap-4">
            <Skeleton className="h-[150px] w-full rounded-[32px]" />
            <Skeleton className="h-[150px] w-full rounded-[32px]" />
          </div>
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-white/80 px-3 py-1 text-slate-700">
                今日完成 {data.completion.done}/{data.completion.total}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full px-3 py-1 text-xs',
                  data.recoveryMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
                )}
              >
                {data.recoveryMode ? '恢复优先' : '正常推进'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 max-w-3xl">
            <p className="text-sm font-medium tracking-wide text-slate-500">今日下一步</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {data.nextAction.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {data.recoveryMode
                ? '今天不用补回昨天的进度，先把最关键的一步做掉，把节奏找回来。'
                : '首页现在只保留一个主动作，先完成它，再看趋势和解释。'}
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
            <p className="text-sm text-slate-500">把这一步做掉，下面的信息才有意义。</p>
          </div>
        </CardContent>
      </Card>

      {data.responseCode === 'PLAN_FALLBACK_USED' ? (
        <Alert className="border-amber-200 bg-amber-50/90 text-amber-900">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="text-amber-900">
            我们先把节奏找回来：今天先补一次体重记录，或者先做一段轻运动，不用一下子做很多。
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <PrimaryActionCard data={data} />

        <div className="grid gap-4">
          <Card className="border-border/70 bg-card/92">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">本周变化</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">这周有没有朝目标前进</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{getDirectionSummary(data)}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <LineChart className="h-5 w-5" />
                </div>
              </div>
              <Link
                href="/trend"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 rounded-xl')}
              >
                查看本周变化
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">这周进展</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{getMilestoneLabel(data)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    不用追求完美，先把连续记录和本周 2 / 3 / 5 次运动里程碑接起来。
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  体重 {data.weightStatus.weighedToday ? '已完成' : '待完成'}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <Flame className="mr-1 h-3.5 w-3.5" />
                  本周运动 {data.activityStatus.exerciseDays7d} 天
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <SecondaryCard data={data} />

        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">今晚复盘 / 明日预览</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  完成今天后，用 1 分钟看看明天先做什么。这里会给你一点解释，但不会打断你先把今天做好。
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                <MoonStar className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-medium text-foreground">白天先完成动作</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  先把白天最重要的一步做掉，再继续下一步，信息不会一股脑压给你。
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-medium text-foreground">晚上再生成调整</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  晚上打开时会先看看今天的记录够不够，再由你决定要不要看明天建议。
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
                会员版会把动作解释、提醒节奏和掉队后的恢复建议讲得更清楚。
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
