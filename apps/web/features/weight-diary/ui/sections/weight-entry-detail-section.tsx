'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  Dna,
  EllipsisVertical,
  Gauge,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchWeightEntry } from '../../api/weights.api';
import type { WeightEntryDetail, WeightMetricRange } from '../../types/weight-diary.types';
import { WeightEntryFormSection } from './weight-entry-form-section';

type RangeSegment = WeightMetricRange['segments'][number];

function segmentColor(color: RangeSegment['color']) {
  if (color === 'green') {
    return 'from-emerald-400 to-lime-400';
  }
  if (color === 'amber') {
    return 'from-amber-300 to-amber-400';
  }
  if (color === 'rose') {
    return 'from-rose-300 to-rose-400';
  }
  return 'from-sky-300 to-cyan-400';
}

function levelBadge(level: string | null) {
  if (!level) {
    return 'bg-slate-100 text-slate-500';
  }
  if (level.includes('正常')) {
    return 'bg-emerald-500 text-white';
  }
  if (level.includes('偏高') || level.includes('超重')) {
    return 'bg-amber-400 text-white';
  }
  if (level.includes('超高') || level.includes('肥胖')) {
    return 'bg-rose-400 text-white';
  }
  return 'bg-sky-400 text-white';
}

function metricIcon(metric: WeightMetricRange['metric']) {
  if (metric === 'bodyFat') {
    return <Dna className="h-4 w-4" />;
  }
  if (metric === 'bmi') {
    return <BadgePercent className="h-4 w-4" />;
  }
  return <Gauge className="h-4 w-4" />;
}

function formatMetricValue(metric: WeightMetricRange['metric'], value: number | null): string {
  if (value === null) {
    return '--';
  }
  if (metric === 'bodyFat' || metric === 'bmi') {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}

function formatMetricUnit(metric: WeightMetricRange['metric'], unit: string): string {
  if (unit) {
    return unit;
  }
  return metric === 'weight' ? '公斤' : '';
}

function formatRangeThreshold(value: number, unit: string): string {
  return `${value.toFixed(1)}${unit}`;
}

function formatDelta(value: number | null, unit: string, digits = 2): string {
  if (value === null) {
    return '--';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(digits)} ${unit}`;
}

function detailDeltaTone(value: number | null): string {
  if (value === null) {
    return 'text-slate-500';
  }
  if (value > 0) {
    return 'text-amber-600';
  }
  if (value < 0) {
    return 'text-emerald-600';
  }
  return 'text-slate-700';
}

function formatMeasuredAt(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildFallbackSegments(metric: WeightMetricRange['metric']): RangeSegment[] {
  if (metric === 'weight') {
    return [
      { label: '偏瘦', min: null, max: null, color: 'sky' },
      { label: '正常', min: null, max: null, color: 'green' },
      { label: '超重', min: null, max: null, color: 'amber' },
      { label: '肥胖', min: null, max: null, color: 'rose' },
    ];
  }

  return [
    { label: '偏低', min: null, max: null, color: 'sky' },
    { label: '正常', min: null, max: null, color: 'green' },
    { label: '偏高', min: null, max: null, color: 'amber' },
    { label: '超高', min: null, max: null, color: 'rose' },
  ];
}

function buildRangeBounds(range: WeightMetricRange, segmentCount: number): number[] {
  if (range.thresholds.length > 0) {
    const thresholds = range.thresholds;
    const firstSpan =
      thresholds.length > 1
        ? thresholds[1] - thresholds[0]
        : Math.max(Math.abs(thresholds[0]) * 0.25, 1);
    const lastSpan =
      thresholds.length > 1
        ? thresholds[thresholds.length - 1] - thresholds[thresholds.length - 2]
        : firstSpan;

    return [
      thresholds[0] - firstSpan,
      ...thresholds,
      thresholds[thresholds.length - 1] + lastSpan,
    ];
  }

  const baseValue =
    range.value ?? (range.metric === 'bodyFat' ? 20 : range.metric === 'bmi' ? 24 : 60);
  const defaultSpan =
    range.metric === 'bodyFat'
      ? 12
      : range.metric === 'bmi'
        ? 6
        : Math.max(baseValue * 0.35, 12);
  const min = Math.max(0, baseValue - defaultSpan);
  const max = baseValue + defaultSpan;
  const step = (max - min) / segmentCount;

  return Array.from({ length: segmentCount + 1 }, (_, index) => min + step * index);
}

function buildThresholdLabels(range: WeightMetricRange, segmentCount: number) {
  if (range.thresholds.length === 0) {
    return [];
  }

  return range.thresholds.map((threshold, index) => ({
    label: formatRangeThreshold(threshold, range.unit),
    left: `${((index + 1) / segmentCount) * 100}%`,
  }));
}

function buildMarkerPosition(value: number | null, bounds: number[]): string | null {
  if (value === null || bounds.length < 2) {
    return null;
  }

  const segmentCount = bounds.length - 1;
  const clampedValue = Math.min(Math.max(value, bounds[0]), bounds[bounds.length - 1]);

  for (let index = 0; index < segmentCount; index += 1) {
    const start = bounds[index];
    const end = bounds[index + 1];

    if (clampedValue <= end || index === segmentCount - 1) {
      const span = end - start || 1;
      const ratio = (clampedValue - start) / span;
      return `${((index + ratio) / segmentCount) * 100}%`;
    }
  }

  return '50%';
}

function MetricRangePanel({
  title,
  caption,
  range,
}: {
  title: string;
  caption?: string;
  range: WeightMetricRange;
}) {
  const [expanded, setExpanded] = useState(true);
  const displaySegments = useMemo(
    () => (range.segments.length > 0 ? range.segments : buildFallbackSegments(range.metric)),
    [range.metric, range.segments],
  );
  const bounds = useMemo(
    () => buildRangeBounds(range, displaySegments.length),
    [displaySegments.length, range],
  );
  const thresholdLabels = useMemo(
    () => buildThresholdLabels(range, displaySegments.length),
    [displaySegments.length, range],
  );
  const markerPosition = useMemo(
    () => buildMarkerPosition(range.value, bounds),
    [bounds, range.value],
  );
  const unitLabel = formatMetricUnit(range.metric, range.unit);
  const markerValue = `${formatMetricValue(range.metric, range.value)}${unitLabel ? ` ${unitLabel}` : ''}`;
  const isFallbackAxis = range.segments.length === 0;

  return (
    <Card className="overflow-hidden rounded-[28px] border border-white/55 bg-white/84 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.24)] backdrop-blur-xl">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
          aria-expanded={expanded}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            {metricIcon(range.metric)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-slate-900">{title}</p>
              {range.estimated ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  估算
                </span>
              ) : null}
            </div>
            {caption ? <p className="mt-1 text-[12px] text-slate-400">{caption}</p> : null}
          </div>

          <div className="shrink-0 text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[1.4rem] font-semibold leading-none text-slate-950">
                {formatMetricValue(range.metric, range.value)}
              </span>
              {unitLabel ? (
                <span className="text-[12px] font-medium text-slate-400">{unitLabel}</span>
              ) : null}
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                  levelBadge(range.level),
                )}
              >
                {range.level ?? '暂无'}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform duration-200',
                  expanded && 'rotate-180',
                )}
              />
            </div>
          </div>
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            expanded ? 'grid-rows-[1fr] border-t border-slate-100' : 'grid-rows-[0fr] border-t border-transparent',
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                'px-4 pb-4 pt-5 transition-all duration-300 ease-out',
                expanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
              )}
            >
              <div className="relative">
                <div className="relative px-2 pt-[3.5rem]">
                  {thresholdLabels.map((threshold) => (
                    <div
                      key={`${title}-${threshold.label}`}
                      className="absolute top-[28px] -translate-x-1/2 text-[10px] font-medium text-slate-400"
                      style={{ left: threshold.left }}
                    >
                      {threshold.label}
                    </div>
                  ))}

                  <div className="relative">
                    <div className="overflow-hidden rounded-full">
                      <div className="flex h-3.5 w-full">
                        {displaySegments.map((segment) => (
                          <div
                            key={`${title}-${segment.label}`}
                            className={cn('h-full flex-1 bg-gradient-to-r', segmentColor(segment.color))}
                          />
                        ))}
                      </div>
                    </div>

                    {markerPosition ? (
                      <div
                        className="absolute -top-14 -translate-x-1/2 transition-transform duration-300 ease-out"
                        style={{ left: `clamp(44px, ${markerPosition}, calc(100% - 44px))` }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="rounded-full border border-slate-200/60 bg-white/96 px-2.5 py-1 text-[10px] font-semibold text-slate-900 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                            {markerValue}
                          </div>
                          <div className="mt-1 h-4 w-px bg-gradient-to-b from-slate-300 to-slate-400" />
                          <div className="h-2.5 w-2.5 rotate-45 rounded-[3px] border-2 border-white bg-slate-900 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.9)]" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className="mt-3 grid gap-1.5 px-1"
                  style={{ gridTemplateColumns: `repeat(${displaySegments.length}, minmax(0, 1fr))` }}
                >
                  {displaySegments.map((segment) => (
                    <div key={`${title}-${segment.label}-label`} className="text-center">
                      <div className="text-[11px] font-medium text-slate-600">{segment.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
                {isFallbackAxis
                  ? `当前数值 ${markerValue}。缺少个性化判定条件，当前按通用分段样式展示；补充后将展示更准确的区间位置。`
                  : `当前数值 ${markerValue}，判定为${range.level ?? '暂无'}。`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightEntryDetailSection({ entryId }: { entryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [data, setData] = useState<WeightEntryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const nextData = await fetchWeightEntry(entryId);

        if (!active) {
          return;
        }

        setData(nextData);
      } catch {
        if (!active) {
          return;
        }

        setError('详情加载失败，请稍后重试。');
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
  }, [entryId]);

  if (mode === 'edit') {
    return <WeightEntryFormSection entryId={entryId} />;
  }

  if (isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-[220px] rounded-[32px]" />
        <Skeleton className="h-[150px] rounded-[28px]" />
        <Skeleton className="h-[150px] rounded-[28px]" />
        <Skeleton className="h-[150px] rounded-[28px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-page">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '详情暂时不可用。'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/diary');
  };

  return (
    <div className="app-page space-y-4 px-4 pt-4">
      <section className="hero-panel overflow-hidden px-4 pb-5 pt-4">
        <div className="flex items-center justify-between text-white">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="section-eyebrow">报告详情</p>
            <h1 className="mt-1 text-[1.2rem] font-semibold">单次记录</h1>
          </div>

          <Link
            href={`/weight/${entryId}?mode=edit`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"
          >
            <EllipsisVertical className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-4 rounded-[26px] bg-white/14 p-4 backdrop-blur">
          <p className="text-[12px] font-medium text-white/72">{formatMeasuredAt(data.measuredAt)}</p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] text-white/72">体重</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-[3rem] font-semibold leading-none tracking-[-0.08em] text-white">
                  {data.weightKg.toFixed(2)}
                </span>
                <span className="pb-1 text-[14px] font-medium text-white/72">公斤</span>
              </div>
            </div>

            <span
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold',
                levelBadge(data.weightLevel),
              )}
            >
              {data.weightLevel ?? '暂无'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/68">较上次</p>
              <p
                className={cn(
                  'mt-1 text-[15px] font-semibold',
                  detailDeltaTone(data.deltaFromPreviousKg),
                )}
              >
                {formatDelta(data.deltaFromPreviousKg, 'kg')}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/68">BMI</p>
              <p className="mt-1 text-[15px] font-semibold text-white">
                {data.bmi === null ? '--' : data.bmi.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/68">体脂估算</p>
              <p className="mt-1 text-[15px] font-semibold text-white">
                {data.estimatedBodyFatPct === null ? '--' : `${data.estimatedBodyFatPct.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <MetricRangePanel title="体重" range={data.ranges.weight} />
      <MetricRangePanel title="体脂" caption="按 BMI 估算，仅供参考" range={data.ranges.bodyFat} />
      <MetricRangePanel title="BMI" range={data.ranges.bmi} />

      <Card className="overflow-hidden rounded-[28px] border border-white/55 bg-white/84 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.24)] backdrop-blur-xl">
        <CardContent className="p-4">
          <p className="text-[15px] font-semibold text-slate-900">备注</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">
            {data.note?.trim() || '暂无内容'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
