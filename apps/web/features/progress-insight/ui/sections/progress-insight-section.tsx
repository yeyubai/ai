'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Flame, LockKeyhole, Scale, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMonthlyProgress, fetchWeeklyProgress, fetchWeeklyReport } from '../../api/progress.api';
import type { ProgressRangeData, WeeklyReportData } from '../../types/progress.types';

function formatWeightChange(points: ProgressRangeData['weightTrendPoints']): string {
  const first = points.find((item) => item.weightKg !== null);
  const last = [...points].reverse().find((item) => item.weightKg !== null);
  if (!first || !last) {
    return '--';
  }

  const value = Number((last.weightKg! - first.weightKg!).toFixed(1));
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} kg`;
}

export function ProgressInsightSection() {
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const [progress, setProgress] = useState<ProgressRangeData | null>(null);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      const [progressData, reportData] = await Promise.all([
        range === 'weekly' ? fetchWeeklyProgress() : fetchMonthlyProgress(),
        fetchWeeklyReport(),
      ]);
      if (!active) {
        return;
      }
      setProgress(progressData);
      setReport(reportData);
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [range]);

  const weightChangeText = useMemo(
    () => (progress ? formatWeightChange(progress.weightTrendPoints) : '--'),
    [progress],
  );

  if (isLoading || !progress || !report) {
    return <Skeleton className="h-[560px] w-full rounded-3xl" />;
  }

  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur motion-enter">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">进度洞察</Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          看懂体重和运动是不是在同一个方向上
        </CardTitle>
        <CardDescription>这里负责解释体重趋势、运动执行和周消耗，不再把饮食睡眠放成首屏主指标。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button variant={range === 'weekly' ? 'default' : 'outline'} onClick={() => setRange('weekly')}>7 日</Button>
          <Button variant={range === 'monthly' ? 'default' : 'outline'} onClick={() => setRange('monthly')}>30 日</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4 text-primary" />
              <p className="text-sm">体重变化</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{weightChangeText}</p>
            <p className="mt-2 text-sm text-muted-foreground">已记录体重 {progress.weighInDays} 天</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" />
              <p className="text-sm">运动执行率</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{Math.round(progress.exerciseCompletionRate * 100)}%</p>
            <p className="mt-2 text-sm text-muted-foreground">完成运动 {progress.exerciseDays} 天</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarRange className="h-4 w-4 text-primary" />
              <p className="text-sm">总消耗</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{progress.burnKcalTotal} kcal</p>
            <p className="mt-2 text-sm text-muted-foreground">本周期内累计运动消耗</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              <p className="font-semibold">体重趋势</p>
            </div>
            <div className="mt-4 grid gap-2">
              {progress.weightTrendPoints.slice(-7).map((point) => (
                <div key={point.date} className="flex items-center justify-between rounded-xl bg-muted/55 px-3 py-2 text-sm">
                  <span>{point.date}</span>
                  <span className={point.isMissing ? 'text-muted-foreground' : 'font-medium'}>
                    {point.weightKg === null ? '缺失' : `${point.weightKg} kg`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-border/70 bg-muted/55 p-4">
              <p className="font-semibold">当前里程碑</p>
              <p className="mt-3 text-sm text-muted-foreground">{progress.milestone.current}</p>
              <p className="mt-3 text-sm text-muted-foreground">下一步：{progress.milestone.next}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <p className="font-semibold">AI 周回顾</p>
              <p className="mt-2 text-base">{report.summary.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{report.summary.body}</p>
            </div>
          </div>
        </div>

        {report.lockedSections.length > 0 ? (
          <Alert className="border-border/70 bg-muted/50">
            <LockKeyhole className="h-4 w-4 text-primary" />
            <AlertDescription>
              深度洞察已锁定：{report.lockedSections.join('、')}。会员版会在你先拿到基础价值之后，再展示更细解释。
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
