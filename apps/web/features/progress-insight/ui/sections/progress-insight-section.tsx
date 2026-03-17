'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CalendarRange,
  Flame,
  LineChart,
  LockKeyhole,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnsureSessionReady } from '@/features/auth/hooks/use-ensure-session-ready';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { PageSkeleton } from '@/shared/feedback/page-skeleton';
import { StatusAlert } from '@/shared/feedback/status-alert';
import { progressMessages } from '../../copy/progress.messages';
import { useProgressInsightResource } from '../../hooks/use-progress-insight-resource';
import type { ProgressRange, ProgressRangeData } from '../../types/progress.types';

function formatWeightChange(points: ProgressRangeData['weightTrendPoints']): number | null {
  const first = points.find((item) => item.weightKg !== null);
  const last = [...points].reverse().find((item) => item.weightKg !== null);
  if (!first || !last) {
    return null;
  }

  return Number((last.weightKg! - first.weightKg!).toFixed(1));
}

function getDirectionCopy(progress: ProgressRangeData): string {
  const change = formatWeightChange(progress.weightTrendPoints);
  const changeText =
    change === null ? '--' : `${change > 0 ? '+' : ''}${change.toFixed(1)}kg`;
  const completionRate = Math.round(progress.exerciseCompletionRate * 100);

  if (change !== null && change < 0 && progress.exerciseCompletionRate >= 0.5) {
    return `过去 ${progress.weightTrendPoints.length <= 7 ? '7' : '30'} 天体重变化 ${changeText}，运动执行率 ${completionRate}%，方向正确，但还要继续守住连续性。`;
  }

  if (progress.exerciseCompletionRate >= 0.5) {
    return `过去 ${progress.weightTrendPoints.length <= 7 ? '7' : '30'} 天体重变化 ${changeText}，运动执行率 ${completionRate}%，节奏已经建立，下一步更看重体重连续记录。`;
  }

  return `过去 ${progress.weightTrendPoints.length <= 7 ? '7' : '30'} 天体重变化 ${changeText}，运动执行率 ${completionRate}%，方向还在建立中，先把记录连续性拉起来。`;
}

function getMilestoneCopy(progress: ProgressRangeData): string {
  if (progress.exerciseDays >= 5) {
    return '本周期运动达到 5 天，已经进入稳定区间';
  }
  if (progress.exerciseDays >= 3) {
    return '本周期运动达到 3 天，已经跨过起步门槛';
  }
  if (progress.weighInDays >= 3) {
    return '体重记录开始连续了，接下来把运动频次接起来';
  }

  return '先把连续记录建立起来，里程碑会很快出现';
}

export function ProgressInsightSection() {
  useEnsureSessionReady();

  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);
  const [range, setRange] = useState<ProgressRange>('weekly');
  const progressResource = useProgressInsightResource(
    range,
    Boolean(token) && sessionStatus === 'ready',
  );

  if (
    sessionStatus === 'loading' ||
    sessionStatus === 'idle' ||
    progressResource.isLoading
  ) {
    return <PageSkeleton blocks={['h-[620px] rounded-3xl']} className="px-0" />;
  }

  if (sessionStatus === 'error') {
    return (
      <div className="app-page space-y-4 px-0">
        <StatusAlert
          variant="destructive"
          message="当前会话建立失败，请重试后再查看进度洞察。"
        />
        <Button
          type="button"
          className="w-fit rounded-2xl"
          onClick={() => void ensureGuestSession()}
        >
          重新建立会话
        </Button>
      </div>
    );
  }

  if (!progressResource.data) {
    return (
      <div className="app-page px-0">
        <StatusAlert
          variant="destructive"
          message={progressResource.error?.displayMessage ?? progressMessages.unavailable}
        />
      </div>
    );
  }

  const { progress, report } = progressResource.data;
  const weightChange = formatWeightChange(progress.weightTrendPoints);
  const weightChangeText =
    weightChange === null
      ? '--'
      : `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`;

  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur motion-enter">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">
          进度洞察
        </Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          这周有没有朝目标前进
        </CardTitle>
        <CardDescription>
          这里先告诉你这周做得怎么样，再补充体重趋势、运动频率和整体进展。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressResource.error?.displayMessage ? (
          <StatusAlert
            variant="destructive"
            message={progressResource.error.displayMessage}
          />
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variant={range === 'weekly' ? 'default' : 'outline'}
            onClick={() => setRange('weekly')}
          >
            7 日
          </Button>
          <Button
            variant={range === 'monthly' ? 'default' : 'outline'}
            onClick={() => setRange('monthly')}
          >
            30 日
          </Button>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-background/85 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">先看结论</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {getDirectionCopy(progress)}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                先看这周整体有没有往目标前进，再去看具体数字。
              </p>
            </div>
            <div className="rounded-3xl bg-primary/10 p-3 text-primary">
              <LineChart className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4 text-primary" />
              <p className="text-sm">体重变化</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{weightChangeText}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              已记录体重 {progress.weighInDays} 天
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" />
              <p className="text-sm">运动执行率</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {Math.round(progress.exerciseCompletionRate * 100)}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              完成运动 {progress.exerciseDays} 天
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarRange className="h-4 w-4 text-primary" />
              <p className="text-sm">总消耗</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">{progress.burnKcalTotal} kcal</p>
            <p className="mt-2 text-sm text-muted-foreground">本周期累计运动消耗</p>
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
                <div
                  key={point.date}
                  className="flex items-center justify-between rounded-xl bg-muted/55 px-3 py-2 text-sm"
                >
                  <span>{point.date}</span>
                  <span
                    className={
                      point.isMissing
                        ? 'text-muted-foreground'
                        : 'font-medium text-foreground'
                    }
                  >
                    {point.weightKg === null ? '缺失' : `${point.weightKg} kg`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-border/70 bg-muted/55 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-semibold">这周进展</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {getMilestoneCopy(progress)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">
                  运动 2 / 3 / 5 次里程碑
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  恢复后 48 小时回归
                </Badge>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <p className="font-semibold">AI 周回顾</p>
              <p className="mt-2 text-base">{report.summary.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {report.summary.body}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                当前里程碑：{progress.milestone.current}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                下一步：{progress.milestone.next}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}
          >
            回首页继续今天
          </Link>
          <Link
            href="/checkins"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl')}
          >
            去记录中心
          </Link>
        </div>

        {report.lockedSections.length > 0 ? (
          <Alert className="border-border/70 bg-muted/50">
            <LockKeyhole className="h-4 w-4 text-primary" />
            <AlertDescription>
              更细的趋势解释、提醒节奏和掉队后的恢复建议需要会员版，重点不是更多功能，而是让坚持更稳。
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
