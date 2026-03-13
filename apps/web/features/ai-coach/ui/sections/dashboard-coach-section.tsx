'use client';

import Link from 'next/link';
import { ArrowRight, CircleCheckBig, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { useCoachStore } from '../../model/coach.store';
import { getClientTimezone, getTodayDateString } from './coach-utils';

export function DashboardCoachSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const plan = useCoachStore((state) => state.plan);
  const planStatus = useCoachStore((state) => state.planStatus);
  const planError = useCoachStore((state) => state.planError);
  const planErrorCode = useCoachStore((state) => state.planErrorCode);
  const planTraceId = useCoachStore((state) => state.planTraceId);
  const planRefreshBlocked = useCoachStore((state) => state.planRefreshBlocked);
  const fetchPlan = useCoachStore((state) => state.fetchPlan);

  const timezone = useMemo(() => getClientTimezone(), []);
  const today = useMemo(() => getTodayDateString(timezone), [timezone]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (plan?.date === today) {
      return;
    }

    void fetchPlan({
      date: today,
      timezone,
      forceRefresh: false,
    }).then((success) => {
      if (success) {
        return;
      }

      if (useCoachStore.getState().planErrorCode === 'AUTH_EXPIRED') {
        logout();
        router.replace('/auth/login');
      }
    });
  }, [fetchPlan, logout, plan?.date, router, today, token, timezone]);

  const handleRefresh = async () => {
    if (planRefreshBlocked || isRefreshing || !token) {
      return;
    }

    setIsRefreshing(true);
    const success = await fetchPlan({
      date: today,
      timezone,
      forceRefresh: true,
    });
    setIsRefreshing(false);

    if (!success && useCoachStore.getState().planErrorCode === 'AUTH_EXPIRED') {
      logout();
      router.replace('/auth/login');
    }
  };

  const shouldShowLoading = planStatus === 'loading' && !plan;

  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/75 to-accent/65">
        <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.14em]">
          RQ-003 / FE-3.2
        </Badge>
        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
          <Sparkles className="h-6 w-6 text-primary" />
          今日 AI 计划
        </CardTitle>
        <CardDescription>先看计划，再去完成打卡，晚上回来做复盘更高效。</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {shouldShowLoading ? (
          <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : null}

        {!shouldShowLoading && plan ? (
          <div className="rounded-2xl border border-border/70 bg-muted/55 p-4 motion-enter motion-delay-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                日期：{plan.date} · 目标热量：{plan.calorieTargetKcal} kcal
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRefresh}
                disabled={planRefreshBlocked || isRefreshing}
              >
                {isRefreshing ? '刷新中...' : '手动刷新计划'}
              </Button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="surface-card p-3">
                <p className="text-xs text-muted-foreground">建议来源</p>
                <p className="mt-1 text-sm font-semibold">{plan.source === 'fallback' ? 'Fallback 通用建议' : 'AI 个性化建议'}</p>
              </div>
              <div className="surface-card p-3">
                <p className="text-xs text-muted-foreground">关键动作数</p>
                <p className="mt-1 text-sm font-semibold">{plan.topActions.length} 条</p>
              </div>
              <div className="surface-card p-3">
                <p className="text-xs text-muted-foreground">餐次规划</p>
                <p className="mt-1 text-sm font-semibold">{plan.meals.length} 餐</p>
              </div>
            </div>

            {plan.source === 'fallback' ? (
              <Alert className="mt-3 border-amber-300 bg-amber-50 text-amber-700">
                <AlertDescription className="text-amber-700">
                  当前为通用建议（fallback），建议先补齐最近打卡数据。
                </AlertDescription>
              </Alert>
            ) : null}

            <p className="mt-3 text-sm text-muted-foreground">{plan.summaryText}</p>
            <ul className="mt-3 space-y-2 text-sm motion-stagger">
              {plan.topActions.map((action) => (
                <li key={action} className="flex items-start gap-2 rounded-lg bg-background/85 px-3 py-2">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!shouldShowLoading && !plan ? (
          <div className="rounded-2xl border border-dashed border-border/90 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            先完成打卡，再生成今日计划。
          </div>
        ) : null}

        {planError ? (
          <Alert variant="destructive">
            <AlertDescription>{planError}</AlertDescription>
          </Alert>
        ) : null}
        {planTraceId ? <p className="text-xs text-muted-foreground">traceId: {planTraceId}</p> : null}

        {planErrorCode === 'AI_RATE_LIMIT' ? (
          <p className="text-xs text-amber-700">今日刷新已达上限，可直接查看计划详情。</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 motion-enter motion-delay-2">
          <Link
            href="/coach/plan"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}
          >
            查看计划详情
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/coach/review"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}
          >
            进入晚间复盘
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/checkins/weight"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}
          >
            去体重打卡
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/checkins/meal"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}
          >
            去饮食打卡
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
