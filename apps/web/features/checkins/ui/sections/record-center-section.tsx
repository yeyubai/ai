'use client';

import Link from 'next/link';
import { Activity, ArrowRight, MoonStar, Scale, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { fetchCheckinHistory, fetchTodayCheckins } from '../../api/checkins.api';
import type { CheckinFeedItem } from '../../types/checkins.types';

function SummaryCard({
  title,
  description,
  value,
  href,
  icon,
}: {
  title: string;
  description: string;
  value: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const Icon = icon;

  return (
    <Card className="border-border/70 bg-card/92">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <Link href={href} className={cn(buttonVariants({ size: 'sm' }), 'mt-5 rounded-xl')}>
          去记录
        </Link>
      </CardContent>
    </Card>
  );
}

export function RecordCenterSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [todayItems, setTodayItems] = useState<CheckinFeedItem[]>([]);
  const [weightHistory, setWeightHistory] = useState<CheckinFeedItem[]>([]);
  const [activityHistory, setActivityHistory] = useState<CheckinFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      router.replace('/auth/login');
      return;
    }

    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [today, weight, activity] = await Promise.all([
          fetchTodayCheckins(),
          fetchCheckinHistory('weight'),
          fetchCheckinHistory('activity'),
        ]);
        if (!active) {
          return;
        }
        setTodayItems(today);
        setWeightHistory(weight);
        setActivityHistory(activity);
      } catch {
        if (!active) {
          return;
        }
        setError('记录中心加载失败，请稍后重试。');
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
  }, [router, token]);

  const todayWeight = useMemo(
    () => todayItems.find((item) => item.type === 'weight') ?? null,
    [todayItems],
  );
  const todayActivity = useMemo(
    () => todayItems.find((item) => item.type === 'activity') ?? null,
    [todayItems],
  );

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-[180px] w-full rounded-[32px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[220px] w-full rounded-[32px]" />
          <Skeleton className="h-[220px] w-full rounded-[32px]" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
          <Badge variant="secondary" className="w-fit">记录中心</Badge>
          <CardTitle className="text-3xl">先完成体重和运动这两个核心记录</CardTitle>
          <CardDescription>饮食和睡眠继续保留，但这轮不会抢走首页和 AI 的主线。</CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <SummaryCard
          title="今日体重"
          value={todayWeight?.displayValue ?? '今天还没记录'}
          description={todayWeight ? '体重已经同步回首页，接下来优先去完成运动。' : '先称一次体重，首页和 AI 才知道今天该怎么推进。'}
          href="/checkins/weight"
          icon={Scale}
        />
        <SummaryCard
          title="今日运动"
          value={todayActivity?.displayValue ?? '今天还没记录'}
          description={todayActivity ? '运动消耗已经同步回进度页和晚间 AI 调整。' : '完成运动后记一下时长和消耗，首页会立即更新。'}
          href="/checkins/activity"
          icon={Activity}
        />
      </section>

      <Card className="border-border/70 bg-card/92">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          <div>
            <p className="font-semibold">最近 7 天体重</p>
            <div className="mt-3 space-y-2">
              {weightHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">先完成几天体重记录，再回来查看变化。</p>
              ) : (
                weightHistory.slice(0, 7).map((item) => (
                  <div key={item.checkinId} className="flex items-center justify-between rounded-xl bg-muted/55 px-3 py-2 text-sm">
                    <span>{item.checkinDate}</span>
                    <span className="font-medium">{item.displayValue}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold">最近 7 天运动完成 / 消耗</p>
            <div className="mt-3 space-y-2">
              {activityHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">先完成几次运动记录，再回来查看执行节奏。</p>
              ) : (
                activityHistory.slice(0, 7).map((item) => (
                  <div key={item.checkinId} className="flex items-center justify-between rounded-xl bg-muted/55 px-3 py-2 text-sm">
                    <span>{item.checkinDate}</span>
                    <span className="font-medium">{item.displayValue}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          <Link
            href="/checkins/meal"
            className="group flex items-center justify-between rounded-2xl border border-border/70 bg-background/85 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">辅助饮食记录</p>
                <p className="text-sm text-muted-foreground">保留入口，但不再作为主流程</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
          </Link>
          <Link
            href="/checkins/sleep"
            className="group flex items-center justify-between rounded-2xl border border-border/70 bg-background/85 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <MoonStar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">辅助睡眠记录</p>
                <p className="text-sm text-muted-foreground">继续可用，但不影响首页主任务</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
