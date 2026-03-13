'use client';

import Link from 'next/link';
import { ArrowLeft, CircleCheckBig, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useCoachStore } from '../../model/coach.store';
import { getClientTimezone, getTodayDateString } from './coach-utils';

export function PlanDetailSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const plan = useCoachStore((state) => state.plan);
  const planStatus = useCoachStore((state) => state.planStatus);
  const planError = useCoachStore((state) => state.planError);
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
    if (!token || isRefreshing || planRefreshBlocked) {
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

  const isLoading = planStatus === 'loading' && !plan;

  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/75 to-accent/65">
        <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.14em]">
          RQ-003 / FE-3.2
        </Badge>
        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
          <Sparkles className="h-6 w-6 text-primary" />
          计划详情
        </CardTitle>
        <CardDescription>按计划执行并完成打卡，晚间复盘会更准确。</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={handleRefresh} disabled={planRefreshBlocked || isRefreshing}>
            {isRefreshing ? '刷新中...' : '手动刷新计划'}
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
            <ArrowLeft className="h-4 w-4" />
            返回 Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}

        {!isLoading && plan ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
              <p className="text-sm font-semibold">
                日期：{plan.date} · 目标热量：{plan.calorieTargetKcal} kcal
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.summaryText}</p>
              {plan.source === 'fallback' ? (
                <Alert className="mt-3 border-amber-300 bg-amber-50 text-amber-700">
                  <AlertDescription className="text-amber-700">
                    当前为通用建议，补齐近期打卡后建议会更个性化。
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">三餐建议</h2>
              <ul className="mt-3 space-y-3">
                {plan.meals.map((meal) => (
                  <li key={meal.name} className="rounded-xl border border-border/70 bg-muted/55 px-3 py-3">
                    <p className="text-sm font-semibold">
                      {meal.name} · {meal.kcal} kcal
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{meal.suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">活动建议</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.activity.type} · {plan.activity.durationMin} 分钟 · 强度 {plan.activity.intensity}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">关键动作</h2>
              <ul className="mt-3 space-y-2">
                {plan.topActions.map((action) => (
                  <li key={action} className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <CircleCheckBig className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.riskFlags.length > 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                <h2 className="font-display text-lg font-semibold">风险提示</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.riskFlags.map((flag) => (
                    <Badge key={flag} variant="outline" className="border-amber-300 text-amber-700">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !plan ? (
          <p className="rounded-2xl border border-dashed border-border/90 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            暂无计划数据，请先在 Dashboard 触发计划生成。
          </p>
        ) : null}

        {planError ? (
          <Alert variant="destructive">
            <AlertDescription>{planError}</AlertDescription>
          </Alert>
        ) : null}
        {planTraceId ? <p className="text-xs text-muted-foreground">traceId: {planTraceId}</p> : null}
      </CardContent>
    </Card>
  );
}
