'use client';

import Link from 'next/link';
import { ArrowRight, Footprints, MoonStar, Scale, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { fetchCheckinHistory, fetchTodayCheckins } from '../../api/checkins.api';
import type { CheckinFeedItem } from '../../types/checkins.types';

function QuickEntryCard({
  title,
  headline,
  body,
  href,
  actionLabel,
  icon: Icon,
}: {
  title: string;
  headline: string;
  body: string;
  href: string;
  actionLabel: string;
  icon: typeof Scale;
}) {
  return (
    <Card className="border-border/70 bg-card/92 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{headline}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
          </div>
          <div className="rounded-3xl bg-primary/10 p-3 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <Link
          href={href}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full justify-between rounded-2xl')}
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function HistoryList({ title, items, emptyText }: { title: string; items: CheckinFeedItem[]; emptyText: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
      <p className="font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          items.slice(0, 7).map((item) => (
            <div
              key={item.checkinId}
              className="flex items-center justify-between rounded-xl bg-muted/55 px-3 py-2 text-sm"
            >
              <span>{item.checkinDate}</span>
              <span className="font-medium text-foreground">
                {item.displayValue}
                {item.isBackfill ? ' · 补录' : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
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

  const todayWeight = todayItems.find((item) => item.type === 'weight') ?? null;
  const todayActivity = todayItems.find((item) => item.type === 'activity') ?? null;

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-[180px] w-full rounded-[32px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[260px] w-full rounded-[32px]" />
          <Skeleton className="h-[260px] w-full rounded-[32px]" />
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
          <Badge variant="secondary" className="w-fit">
            记录中心
          </Badge>
          <CardTitle className="text-3xl">这里就是快速记录，不用先看一堆说明</CardTitle>
          <CardDescription>
            先完成体重和运动两个核心记录，饮食和睡眠继续保留，但只作为背景信息。
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <QuickEntryCard
          title="核心记录 1"
          headline={todayWeight ? '今天体重已记录' : '先记录今天体重'}
          body={
            todayWeight
              ? `${todayWeight.displayValue} 已经记好了，接下来更适合去补上运动。`
              : '越早完成体重记录，首页越能快速判断今天应该先做什么。'
          }
          href="/checkins/weight"
          actionLabel={todayWeight ? '重新记录体重' : '记录体重'}
          icon={Scale}
        />
        <QuickEntryCard
          title="核心记录 2"
          headline={todayActivity ? '今天运动已记录' : '把今天的运动接上'}
          body={
            todayActivity
              ? `${todayActivity.displayValue} 已经记好了，晚上看明天建议时会直接用上。`
              : '先记录有没有完成运动，再补时长和消耗，别把自己卡在复杂表单里。'
          }
          href="/checkins/activity"
          actionLabel={todayActivity ? '更新运动记录' : '记录运动'}
          icon={Footprints}
        />
      </section>

      <Card className="border-border/70 bg-card/92">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          <HistoryList
            title="最近 7 天体重"
            items={weightHistory}
            emptyText="先完成几天体重记录，再回来查看变化。"
          />
          <HistoryList
            title="最近 7 天运动"
            items={activityHistory}
            emptyText="先完成几次运动记录，再回来查看本周节奏。"
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">辅助背景记录</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                饮食和睡眠还可以记，但不会影响你今天先做体重和运动这两件事。
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              可选
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
                  <p className="text-sm text-muted-foreground">需要时再补，不进入主流程</p>
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
                  <p className="text-sm text-muted-foreground">继续可用，但不抢首页优先级</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
