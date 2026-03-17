'use client';

import { useEffect, useState } from 'react';
import { ChartSpline, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchSettings } from '@/features/settings/api/me.api';
import {
  formatWeightNumberByUnit,
  getWeightUnitLabel,
  getWeightUnitName,
} from '@/features/settings/config/weight-unit';
import type { UserSettings } from '@/features/settings/types/settings.types';
import { fetchWeightStats, fetchWeightTrend } from '@/features/weight-diary/api/weights.api';
import { MiniLineChart } from '@/features/weight-diary/ui/components/mini-line-chart';
import type { WeightStats, WeightTrend } from '@/features/weight-diary/types/weight-diary.types';

type Range = '7d' | '30d' | '90d' | 'all';

const ranges: Array<{ key: Range; label: string }> = [
  { key: '7d', label: '默认' },
  { key: '30d', label: '近一月' },
  { key: '90d', label: '近三月' },
  { key: 'all', label: '全部' },
];

function formatMetric(value: number | null): string {
  return value === null ? '--' : value.toFixed(2);
}

function TrendMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-4xl font-semibold">{value}</p>
        {unit ? (
          <span className="pb-1 text-sm font-medium text-slate-500">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}

export function TrendSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [range, setRange] = useState<Range>('7d');
  const [trend, setTrend] = useState<WeightTrend | null>(null);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<WeightTrend['points'][number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setTrend(null);
      setStats(null);
      setSettings(null);

      try {
        const [nextTrend, nextStats, nextSettings] = await Promise.all([
          fetchWeightTrend(range),
          fetchWeightStats(range),
          fetchSettings(),
        ]);
        if (!active) {
          return;
        }
        setTrend(nextTrend);
        setStats(nextStats);
        setSettings(nextSettings);
        setSelectedPoint(null);
      } catch {
        if (!active) {
          return;
        }
        setError('趋势加载失败，请稍后重试。');
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
  }, [range, sessionStatus, token]);

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-[420px] rounded-[34px]" />
        <Skeleton className="h-[160px] rounded-[30px]" />
      </div>
    );
  }

  if (!trend || !stats || !settings) {
    return (
      <div className="app-page">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '趋势暂时不可用。'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const weightUnit = settings.weightUnit;
  const weightUnitLabel = getWeightUnitLabel(weightUnit);

  return (
    <div className="app-page space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="hero-panel overflow-hidden border border-white/15 p-5 shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartSpline className="h-6 w-6" />
            <div>
              <p className="text-sm text-white/75">趋势</p>
              <h1 className="text-4xl font-semibold">体重</h1>
              <p className="mt-1 text-sm text-white/70">
                当前按 {getWeightUnitName(weightUnit)}（{weightUnitLabel}）展示
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 overflow-hidden rounded-[24px] border border-white/30 bg-white/10 text-sm font-semibold">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRange(item.key)}
              className={
                item.key === range
                  ? 'bg-white/75 px-2 py-3 text-slate-900'
                  : 'border-l border-white/20 px-2 py-3 text-white/75 first:border-l-0'
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <MiniLineChart points={trend.points} onSelect={setSelectedPoint} />
          <p className="mt-4 text-center text-sm text-white/72">
            点按折线上的节点，可查看当天记录
          </p>
        </div>
      </section>

      <Card className="glass-card border-none">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-4">
          <TrendMetric label="记录天数" value={`${stats.recordDays}`} />
          <TrendMetric
            label="数值变化"
            value={
              stats.netChangeKg === null
                ? '--'
                : formatWeightNumberByUnit(stats.netChangeKg, weightUnit, 2)
            }
            unit={stats.netChangeKg === null ? undefined : weightUnitLabel}
          />
          <TrendMetric
            label="最高"
            value={
              stats.highestWeightKg === null
                ? '--'
                : formatWeightNumberByUnit(stats.highestWeightKg, weightUnit, 2)
            }
            unit={stats.highestWeightKg === null ? undefined : weightUnitLabel}
          />
          <TrendMetric
            label="最低"
            value={
              stats.lowestWeightKg === null
                ? '--'
                : formatWeightNumberByUnit(stats.lowestWeightKg, weightUnit, 2)
            }
            unit={stats.lowestWeightKg === null ? undefined : weightUnitLabel}
          />
        </CardContent>
      </Card>

      {selectedPoint ? (
        <Card className="glass-card border-none">
          <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">当天数据</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {selectedPoint.weightKg === null
                  ? '--'
                  : `${formatWeightNumberByUnit(selectedPoint.weightKg, weightUnit, 2)} ${weightUnitLabel}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{selectedPoint.date}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedPoint(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
