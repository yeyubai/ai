'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { createEveningReview } from '../../api/review.api';

function getToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function ReviewAdjustmentSection() {
  const today = useMemo(() => getToday(), []);
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<Awaited<ReturnType<typeof createEveningReview>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await createEveningReview(today);
        if (!active) {
          return;
        }
        setData(result);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(
          typeof loadError === 'object' && loadError !== null && 'message' in loadError
            ? String((loadError as { message?: string }).message)
            : '复盘暂时不可用',
        );
        setData(null);
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
  }, [token, today]);

  if (isLoading) {
    return <Skeleton className="h-[440px] w-full rounded-3xl" />;
  }

  return (
    <Card className="border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">晚间 AI 调整</Badge>
        <CardTitle className="text-3xl">根据今天的体重和运动，明天先做什么</CardTitle>
        <CardDescription>这里不负责批评你，只负责把今天的结果接到明天的动作上。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data ? (
          <>
            <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
              <p className="text-sm text-muted-foreground">执行分数</p>
              <p className="mt-2 text-4xl font-semibold">{data.reviewSummary.score}</p>
              <p className="mt-2 text-sm text-muted-foreground">置信度 {Math.round(data.confidence * 100)}%</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="font-semibold">今天做得好的地方</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {data.reviewSummary.highlights.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="font-semibold">明天继续补上的地方</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {data.reviewSummary.gaps.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
              <p className="font-semibold">明天只关注这 {data.tomorrowPreview.maxTasks} 件事</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {data.tomorrowPreview.focus.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            {data.responseCode === 'PLAN_FALLBACK_USED' ? (
              <Alert className="border-amber-300 bg-amber-50 text-amber-800">
                <AlertDescription className="text-amber-800">系统已切换到恢复模式：先把体重记录和一次轻运动接回来，再慢慢恢复正常任务量。</AlertDescription>
              </Alert>
            ) : null}
          </>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}>
            返回首页
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/trend" className={cn(buttonVariants({ size: 'lg' }), 'justify-between')}>
            看这周变化
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
