'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  EllipsisVertical,
  Goal,
  NotebookText,
  PencilLine,
  Plus,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchSettings } from '@/features/settings/api/me.api';
import type { UserSettings } from '@/features/settings/types/settings.types';
import { isApiError } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import {
  createWeightEntry,
  fetchTodaySummary,
  fetchWeightEntries,
} from '../../api/weights.api';
import type { WeightEntryGroups, WeightTodaySummary } from '../../types/weight-diary.types';
import { WeightEntryListCard } from '../components/weight-entry-list-card';

const HEADER_HEIGHT = 76;
const QUICK_RECORD_MIN_WEIGHT = 20;
const QUICK_RECORD_MAX_WEIGHT = 300;

function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getCurrentTimeString(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function formatWeight(value: number | null): string {
  return value === null ? '--' : value.toFixed(2);
}

function formatDelta(value: number | null): string {
  if (value === null) {
    return '--';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatMeasuredTime(value: string): string {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function validateQuickRecordWeight(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return '请输入今天的体重。';
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return '请输入有效的体重数字。';
  }

  if (parsed < QUICK_RECORD_MIN_WEIGHT || parsed > QUICK_RECORD_MAX_WEIGHT) {
    return `体重需要在 ${QUICK_RECORD_MIN_WEIGHT}-${QUICK_RECORD_MAX_WEIGHT}kg 之间。`;
  }

  return null;
}

export function HomeOverviewSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [summary, setSummary] = useState<WeightTodaySummary | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [entries, setEntries] = useState<WeightEntryGroups | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [scrollTop, setScrollTop] = useState(0);

  const todayDate = useMemo(() => getTodayDateString(), []);
  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  const metricsCollapse = Math.min(scrollTop, 72);
  const metricsScale = Math.max(0, 1 - metricsCollapse / 72);
  const headerSolid = scrollTop > 20;

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        setPageError(null);
        setIsLoading(true);

        const [nextSummary, nextSettings, nextEntries] = await Promise.all([
          fetchTodaySummary(),
          fetchSettings(),
          fetchWeightEntries(),
        ]);

        if (!active) {
          return;
        }

        setSummary(nextSummary);
        setSettings(nextSettings);
        setEntries(nextEntries);
      } catch {
        if (!active) {
          return;
        }

        setPageError('首页加载失败，请稍后重试。');
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
  }, [sessionStatus, token]);

  const refreshWeightData = async () => {
    const [nextSummary, nextEntries] = await Promise.all([
      fetchTodaySummary(),
      fetchWeightEntries(),
    ]);

    setSummary(nextSummary);
    setEntries(nextEntries);
  };

  const handleQuickRecord = async () => {
    const validationError = validateQuickRecordWeight(weightKg);
    if (validationError) {
      setRecordError(validationError);
      return;
    }

    setRecordError(null);
    setIsSubmitting(true);

    try {
      await createWeightEntry({
        entryDate: todayDate,
        measuredAt: `${todayDate}T${getCurrentTimeString()}:00+08:00`,
        weightKg: Number(weightKg),
      });

      setWeightKg('');
      setIsRecordOpen(false);

      try {
        await refreshWeightData();
      } catch {
        setPageError('记录已保存，但首页刷新失败，请稍后重试。');
      }
    } catch (error) {
      if (isApiError(error) && error.code === 'INVALID_PARAMS') {
        setRecordError(`体重需要在 ${QUICK_RECORD_MIN_WEIGHT}-${QUICK_RECORD_MAX_WEIGHT}kg 之间。`);
      } else {
        setRecordError('保存失败，请稍后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeypadPress = (value: string) => {
    setRecordError(null);

    setWeightKg((current) => {
      if (value === 'backspace') {
        return current.slice(0, -1);
      }

      if (value === '.') {
        if (current.includes('.')) {
          return current;
        }

        return current.length === 0 ? '0.' : `${current}.`;
      }

      if (current === '0') {
        return value === '0' ? current : value;
      }

      const next = `${current}${value}`;
      const [integer, decimal = ''] = next.split('.');

      if (integer.length > 3 || decimal.length > 2) {
        return current;
      }

      return next;
    });
  };

  const handleRecordOpenChange = (open: boolean) => {
    setIsRecordOpen(open);
    setRecordError(null);

    if (!open) {
      setWeightKg('');
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-[calc(var(--app-tab-bar-offset)+20px)] pt-4">
        <div className="space-y-4">
          <Skeleton className="h-[176px] rounded-[28px]" />
          <Skeleton className="h-[560px] rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!summary || !settings || !entries) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-[calc(var(--app-tab-bar-offset)+20px)] pt-4">
        <Alert variant="destructive">
          <AlertDescription>{pageError ?? '首页暂时不可用。'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const historyGroups = entries.groups.filter(
    (group) => group.date !== summary.todayEntry?.entryDate,
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[calc(var(--app-tab-bar-offset)+20px)] pt-4">
      {pageError ? (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className="h-[calc(100dvh-var(--app-tab-bar-offset)-16px)] overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <header
          className={cn(
            'sticky top-0 z-30 mb-[-76px] flex h-[76px] items-start justify-between px-5 pb-3 pt-4 transition-[background-color,backdrop-filter,box-shadow,color] duration-200',
            headerSolid
              ? 'bg-[linear-gradient(180deg,rgba(46,214,219,0.96),rgba(19,181,191,0.96))] text-white backdrop-blur-xl shadow-[0_12px_30px_-24px_rgba(15,23,42,0.28)]'
              : 'bg-transparent text-white',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <NotebookText className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                首页
              </p>
              <h1 className="mt-1 truncate text-[1.55rem] font-semibold leading-none">
                {settings.diaryName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/diary"
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-sm font-medium transition-colors',
                headerSolid
                  ? 'border border-white/35 bg-white/10 text-white/95'
                  : 'border border-white/35 text-white/95',
              )}
            >
              <CalendarDays className="h-4 w-4" />
              日历
            </Link>
            <Link
              href="/me"
              aria-label="更多"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white/90"
            >
              <EllipsisVertical className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <section className="sticky top-0 z-0">
          <div className="hero-panel min-h-[188px] overflow-hidden px-4 pb-4 pt-[88px]">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-end gap-3">
                  <span className="text-[2.95rem] font-semibold leading-none tracking-[-0.08em]">
                    {formatWeight(summary.latestEntry?.weightKg ?? null)}
                  </span>
                  <span className="pb-1 text-base font-medium">公斤</span>
                </div>
              </div>

              <Link
                href="/me/goal"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/14 px-3 py-2 text-sm font-medium text-white"
              >
                <Goal className="h-4 w-4" />
                设定目标
              </Link>
            </div>

            <div
              className="origin-top overflow-hidden transition-[height,opacity,transform,margin] duration-200 ease-out"
              style={{
                height: `${Math.max(0, 76 - metricsCollapse)}px`,
                opacity: metricsScale,
                transform: `scaleY(${metricsScale})`,
                marginTop: '16px',
              }}
            >
              <div className="rounded-[22px] bg-white/10 backdrop-blur">
                <div className="grid grid-cols-3 divide-x divide-white/15">
                  <div className="px-3 py-3">
                    <p className="text-[11px] text-white/70">BMI</p>
                    <p className="mt-1.5 text-[1.2rem] font-semibold">
                      {summary.bmi === null ? '--' : summary.bmi.toFixed(1)}
                    </p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-[11px] text-white/70">体脂</p>
                    <p className="mt-1.5 text-[1.2rem] font-semibold">
                      {summary.bodyFatPct === null ? '--' : `${summary.bodyFatPct.toFixed(1)}%`}
                    </p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-[11px] text-white/70">体重变化</p>
                    <p className="mt-1.5 text-[1.2rem] font-semibold">
                      {formatDelta(summary.deltaFromStart)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="sticky z-20 mt-3 min-h-[calc(100dvh-var(--app-tab-bar-offset)-76px-16px)] rounded-[30px] bg-[linear-gradient(180deg,rgba(242,246,248,0.995),rgba(233,238,241,0.995))] px-4 pb-[calc(var(--app-tab-bar-offset)+86px)] pt-5 shadow-[0_-18px_60px_-40px_rgba(15,23,42,0.35)]"
          style={{ top: `${HEADER_HEIGHT}px` }}
        >
          <div className="mx-auto max-w-md space-y-4">
            {summary.todayEntry ? (
              <Card className="glass-card border-none">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm text-slate-500">当日记录</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {summary.todayEntry.weightKg.toFixed(2)} 公斤
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatMeasuredTime(summary.todayEntry.measuredAt)}
                    </p>
                  </div>
                  <Link
                    href={`/weight/${summary.todayEntry.id}`}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-white px-3 text-sm font-medium text-slate-700"
                  >
                    <PencilLine className="h-4 w-4" />
                    详情
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            <div className="px-1">
              <p className="text-sm text-slate-500">记录列表</p>
              <h2 className="mt-1 text-[1.6rem] font-semibold text-slate-950">历史记录</h2>
            </div>

            {historyGroups.length === 0 ? (
              <Card className="glass-card border-none">
                <CardContent className="p-6 text-center">
                  <p className="text-lg font-semibold text-slate-900">还没有历史记录</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    从右下角补充第一条体重记录。
                  </p>
                </CardContent>
              </Card>
            ) : (
              historyGroups.map((group) => (
                <div key={group.date} className="space-y-3">
                  <div className="inline-flex rounded-full border border-white/50 bg-white/72 px-4 py-2 text-sm font-medium text-slate-500">
                    {group.date}
                  </div>
                  <div className="space-y-3">
                    {group.entries.map((entry) => (
                      <WeightEntryListCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Dialog open={isRecordOpen} onOpenChange={handleRecordOpenChange}>
        <DialogTrigger asChild>
          <div
            className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--app-tab-bar-offset)+14px)] z-[65] flex justify-center px-3"
          >
            <div className="flex w-full max-w-[375px] justify-end">
              <button
                type="button"
                aria-label="新增体重记录"
                className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-white shadow-[0_18px_40px_-18px_rgba(15,185,196,0.95)] transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="overflow-hidden px-5 pb-0 pt-4">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle>记录体重</DialogTitle>
            <DialogDescription>{todayDate}</DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 grid-rows-[auto_1fr_auto] overflow-hidden px-1 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 text-slate-400">
                <span className="text-3xl leading-none">+</span>
                <span className="mt-2 text-sm">手动录入</span>
              </div>

              <div className="min-w-0 flex-1 text-center">
                <div className="flex items-start justify-center gap-3">
                  <span
                    className={cn(
                      'text-[4.2rem] font-semibold leading-none tracking-[-0.08em]',
                      recordError ? 'text-rose-500' : 'text-slate-500',
                    )}
                  >
                    {weightKg.trim() ? weightKg : '0'}
                  </span>
                  <span className="pt-3 text-xl font-medium text-slate-400">kg</span>
                </div>
                <p
                  className={cn(
                    'mt-1 text-xs',
                    recordError ? 'font-medium text-rose-500' : 'text-slate-400',
                  )}
                >
                  {recordError ?? '用数字键盘快速补充今天的体重，支持 20-300kg。'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 content-start gap-x-5 gap-y-3 px-5 py-2">
              {keypadKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="flex h-11 items-center justify-center rounded-2xl text-[1.85rem] font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  {key === 'backspace' ? '⌫' : key}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 px-1 pt-4">
              <Button
                type="button"
                className="h-12 w-full rounded-[22px] bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-lg font-semibold text-white hover:opacity-95"
                onClick={() => void handleQuickRecord()}
                disabled={isSubmitting || !weightKg.trim()}
              >
                {isSubmitting ? '记录中...' : '记录'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
