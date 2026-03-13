'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { fetchHomeToday } from '../../api/home.api';
import type { HomeTodayResult } from '../../types/home.types';

export function HomePlanDetailSection() {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<HomeTodayResult | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchHomeToday().then(setData).catch(() => setData(null));
  }, [token]);

  if (!data) {
    return <Skeleton className="h-96 w-full rounded-3xl" />;
  }

  return (
    <Card className="border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">任务说明</Badge>
        <CardTitle className="flex items-center gap-2 text-3xl"><Sparkles className="h-6 w-6 text-primary" />今天怎么做更轻松</CardTitle>
        <CardDescription>这里用来补充说明今天的安排，做完以后直接回首页继续下一步就好。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.dailyMission.map((item) => (
          <div key={item.actionId} className="rounded-2xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{item.title}</p>
              <Badge variant={item.status === 'done' ? 'secondary' : 'outline'}>{item.status === 'done' ? '已完成' : '待完成'}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">建议时间：{item.recommendedAt}，任务类型：{item.type}</p>
          </div>
        ))}

        <Alert>
          <AlertDescription>
            当前最优先的一步是：{data.nextAction.title}。完成后默认回到首页，这样你能继续接上今天的节奏。
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'justify-between')}>
            返回首页
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/coach/review" className={cn(buttonVariants({ size: 'lg' }), 'justify-between')}>
            进入晚间复盘
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
