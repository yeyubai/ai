'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, MoonStar, Scale, Footprints } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchHomeToday } from '@/features/home-daily-loop/api/home.api';
import type { HomeTodayResult } from '@/features/home-daily-loop/types/home.types';
import { isApiError } from '@/lib/api/types';
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
  const router = useRouter();
  const today = useMemo(() => getToday(), []);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [homeData, setHomeData] = useState<HomeTodayResult | null>(null);
  const [reviewData, setReviewData] = useState<Awaited<ReturnType<typeof createEveningReview>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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
        setHomeData(result);
      } catch (loadError) {
        if (!active) {
          return;
        }
        if (isApiError(loadError) && loadError.status === 401) {
          logout();
          router.replace('/auth/login');
          return;
        }
        setError('复盘准备状态加载失败，请稍后重试。');
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

  const isReady = Boolean(homeData?.weightStatus.weighedToday || homeData?.activityStatus.completedToday);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await createEveningReview(today);
      setReviewData(result);
    } catch (nextError) {
      if (isApiError(nextError) && nextError.status === 401) {
        logout();
        router.replace('/auth/login');
        return;
      }

      if (isApiError(nextError) && nextError.code === 'REVIEW_NOT_READY') {
        setError('今天还缺少体重或运动记录，先补上至少一个核心动作再来生成复盘。');
        return;
      }

      setError(isApiError(nextError) ? nextError.message : '复盘暂时不可用。');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full rounded-3xl" />;
  }

  return (
    <Card className="border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">
          晚间 AI 调整
        </Badge>
        <CardTitle className="text-3xl">先看看今天的记录够不够，再给你明天建议</CardTitle>
        <CardDescription>这里不批评你，只负责把今天的结果接到明天的动作上。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {homeData ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <p className="text-sm text-muted-foreground">当前状态</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isReady ? '今天已经可以看明天建议了' : '今天的记录还不够，先补一步再来'}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isReady
                  ? '你已经完成了至少一项重要记录，现在可以看看明天先做什么。'
                  : '先完成体重记录或运动记录中的一个，再来看明天建议会更有帮助。'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={homeData.weightStatus.weighedToday ? 'default' : 'outline'} className="rounded-full">
                  <Scale className="mr-1 h-3.5 w-3.5" />
                  体重 {homeData.weightStatus.weighedToday ? '已记录' : '未记录'}
                </Badge>
                <Badge
                  variant={homeData.activityStatus.completedToday ? 'default' : 'outline'}
                  className="rounded-full"
                >
                  <Footprints className="mr-1 h-3.5 w-3.5" />
                  运动 {homeData.activityStatus.completedToday ? '已完成' : '未完成'}
                </Badge>
                {homeData.recoveryMode ? (
                  <Badge variant="secondary" className="rounded-full">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    今天先把节奏找回来
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-muted/55 p-4">
              <p className="font-semibold text-foreground">今天的情况</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                  <p className="font-medium text-foreground">体重状态</p>
                  <p className="mt-1">
                    {homeData.weightStatus.weighedToday
                      ? `已记录当前体重 ${homeData.weightStatus.latestWeightKg?.toFixed(1) ?? '--'} kg。`
                      : '还没有体重记录，明早先称重会更容易进入节奏。'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                  <p className="font-medium text-foreground">运动状态</p>
                  <p className="mt-1">
                    {homeData.activityStatus.completedToday
                      ? `已完成 ${homeData.activityStatus.durationMin} 分钟运动，累计 ${homeData.activityStatus.estimatedKcal} kcal。`
                      : `今天目标 ${homeData.activityStatus.targetDurationMin} 分钟，还可以先从一段轻运动开始。`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!reviewData ? (
          <div className="rounded-3xl border border-border/70 bg-card/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">看看明天先做什么</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isReady
                    ? '准备好之后再点一次，不用先等空白加载。'
                    : '先补一个关键记录，这里就会切换成可查看状态。'}
                </p>
              </div>
              <Button
                className="min-w-[180px] justify-between rounded-2xl"
                onClick={() => void handleGenerate()}
                disabled={!isReady || isGenerating}
              >
                {isGenerating ? '正在整理明天建议...' : '查看明天建议'}
                <MoonStar className="h-4 w-4" />
              </Button>
            </div>

            {!isReady ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {!homeData?.weightStatus.weighedToday ? (
                  <Link href="/checkins/weight" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}>
                    先去记录体重
                  </Link>
                ) : null}
                {!homeData?.activityStatus.completedToday ? (
                  <Link href="/checkins/activity" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}>
                    先去记录运动
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
              <p className="text-sm text-muted-foreground">执行分数</p>
              <p className="mt-2 text-4xl font-semibold">{reviewData.reviewSummary.score}</p>
              <p className="mt-2 text-sm text-muted-foreground">置信度 {Math.round(reviewData.confidence * 100)}%</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="font-semibold">今天做得好的地方</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {reviewData.reviewSummary.highlights.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="font-semibold">明天继续补上的地方</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {reviewData.reviewSummary.gaps.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
              <p className="font-semibold">明天只关注这 {reviewData.tomorrowPreview.maxTasks} 件事</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {reviewData.tomorrowPreview.focus.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            {reviewData.responseCode === 'PLAN_FALLBACK_USED' ? (
              <Alert className="border-amber-300 bg-amber-50 text-amber-800">
                <AlertDescription className="text-amber-800">
                  今天先把节奏找回来：先补一次体重记录，或者先做一段轻运动，明天再继续往上加。
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        )}

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
