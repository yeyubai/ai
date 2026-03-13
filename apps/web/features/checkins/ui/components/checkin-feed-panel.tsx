'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchCheckinHistory, fetchTodayCheckins } from '../../api/checkins.api';
import type { CheckinFeedItem } from '../../types/checkins.types';

export function CheckinFeedPanel({ type }: { type: CheckinFeedItem['type'] }) {
  const [todayItems, setTodayItems] = useState<CheckinFeedItem[]>([]);
  const [historyItems, setHistoryItems] = useState<CheckinFeedItem[]>([]);

  useEffect(() => {
    void Promise.all([fetchTodayCheckins(), fetchCheckinHistory(type)]).then(
      ([today, history]) => {
        setTodayItems(today.filter((item) => item.type === type));
        setHistoryItems(history);
      },
    );
  }, [type]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
        <p className="font-semibold">今天的记录</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {todayItems.length === 0 ? <p>今天还没有这类记录，完成后会同步回首页。</p> : null}
          {todayItems.map((item) => (
            <div key={item.checkinId} className="rounded-xl bg-muted/55 px-3 py-2">
              <p className="font-medium text-foreground">{item.displayValue}</p>
              <p className="mt-1 text-xs">{item.checkinDate}{item.isBackfill ? ' · 补录' : ''}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
        <p className="font-semibold">最近历史</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {historyItems.map((item) => (
            <div key={item.checkinId} className="rounded-xl bg-muted/55 px-3 py-2">
              <p className="font-medium text-foreground">{item.displayValue}</p>
              <p className="mt-1 text-xs">{item.checkinDate}{item.isBackfill ? ' · 补录' : ''}</p>
            </div>
          ))}
        </div>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 w-full justify-between')}>
          回首页看进度
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
