'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
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

export function ReviewSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const review = useCoachStore((state) => state.review);
  const reviewStatus = useCoachStore((state) => state.reviewStatus);
  const reviewError = useCoachStore((state) => state.reviewError);
  const reviewTraceId = useCoachStore((state) => state.reviewTraceId);
  const fetchReview = useCoachStore((state) => state.fetchReview);

  const timezone = useMemo(() => getClientTimezone(), []);
  const today = useMemo(() => getTodayDateString(timezone), [timezone]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (review?.date === today) {
      return;
    }

    void fetchReview({
      date: today,
      timezone,
    }).then((success) => {
      if (success) {
        return;
      }

      if (useCoachStore.getState().reviewErrorCode === 'AUTH_EXPIRED') {
        logout();
        router.replace('/auth/login');
      }
    });
  }, [fetchReview, logout, review?.date, router, today, token, timezone]);

  const handleRetry = async () => {
    if (!token || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const success = await fetchReview({
      date: today,
      timezone,
    });
    setIsSubmitting(false);

    if (!success && useCoachStore.getState().reviewErrorCode === 'AUTH_EXPIRED') {
      logout();
      router.replace('/auth/login');
    }
  };

  const isLoading = reviewStatus === 'loading' && !review;

  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/75 to-accent/65">
        <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.14em]">
          RQ-003 / FE-3.3
        </Badge>
        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
          <Sparkles className="h-6 w-6 text-primary" />
          晚间复盘
        </CardTitle>
        <CardDescription>复盘今天执行情况，并确定明日重点。</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={handleRetry} disabled={isSubmitting}>
            {isSubmitting ? '生成中...' : '重新生成复盘'}
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
            <ArrowLeft className="h-4 w-4" />
            返回 Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}

        {!isLoading && review ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
              <p className="text-sm font-semibold">
                日期：{review.date} · 复盘分数：{review.score}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{review.summaryText}</p>
              {review.source === 'fallback' ? (
                <Alert className="mt-3 border-amber-300 bg-amber-50 text-amber-700">
                  <AlertDescription className="text-amber-700">
                    当前为通用复盘建议，补齐近期记录可获得更精准结果。
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">今天亮点</h2>
              <ul className="mt-3 space-y-2">
                {review.highlights.map((item) => (
                  <li key={item} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">需要改进</h2>
              <ul className="mt-3 space-y-2">
                {review.gaps.map((item) => (
                  <li key={item} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <h2 className="font-display text-lg font-semibold">明日重点</h2>
              <ul className="mt-3 space-y-2">
                {review.tomorrowFocus.map((item) => (
                  <li key={item} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {review.riskFlags.length > 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                <h2 className="font-display text-lg font-semibold">风险提示</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.riskFlags.map((flag) => (
                    <Badge key={flag} variant="outline" className="border-amber-300 text-amber-700">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !review ? (
          <p className="rounded-2xl border border-dashed border-border/90 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
            暂无复盘数据，请先完成今天的打卡再试。
          </p>
        ) : null}

        {reviewError ? (
          <Alert variant="destructive">
            <AlertDescription>{reviewError}</AlertDescription>
          </Alert>
        ) : null}
        {reviewTraceId ? <p className="text-xs text-muted-foreground">traceId: {reviewTraceId}</p> : null}
      </CardContent>
    </Card>
  );
}
