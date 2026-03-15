'use client';

import Link from 'next/link';
import { ChevronRight, Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WeightEntry } from '../../types/weight-diary.types';

function formatMeasuredTime(value: string): string {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDelta(value: number | null): string {
  if (value === null) {
    return '--';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}`;
}

function deltaTone(value: number | null): string {
  if (value === null) {
    return 'text-slate-400';
  }
  if (value > 0) {
    return 'text-amber-600';
  }
  if (value < 0) {
    return 'text-emerald-600';
  }
  return 'text-slate-700';
}

export function WeightEntryListCard({ entry }: { entry: WeightEntry }) {
  return (
    <Link href={`/weight/${entry.id}`} className="block">
      <Card className="overflow-hidden rounded-[28px] border border-white/45 bg-white/82 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.26)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              未同步
            </div>
            <div className="text-[11px] font-medium text-slate-400">手动记录</div>
          </div>

          <div className="grid grid-cols-[58px_minmax(0,1.2fr)_72px_12px] items-center gap-3">
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-[20px] bg-slate-50 text-slate-500">
              <Clock3 className="h-4 w-4 text-cyan-600" />
              <span className="mt-1 text-[12px] font-medium leading-none">
                {formatMeasuredTime(entry.measuredAt)}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.08em] text-slate-400">体重</p>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="whitespace-nowrap text-[1.55rem] font-semibold leading-none tabular-nums text-slate-950">
                  {entry.weightKg.toFixed(2)}
                </span>
                <span className="text-[12px] font-medium text-slate-400">kg</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-medium tracking-[0.04em] text-slate-400">较上次</p>
              <div className="mt-1.5 whitespace-nowrap">
                <span
                  className={cn(
                    'text-[0.95rem] font-semibold leading-none tabular-nums',
                    deltaTone(entry.deltaFromPreviousKg),
                  )}
                >
                  {formatDelta(entry.deltaFromPreviousKg)}
                </span>
                <span className="ml-1 text-[12px] font-medium text-slate-400">kg</span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
