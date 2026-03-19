'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileSearch2, LayoutGrid } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { DiaryFloatingAddButton } from '../components/diary-floating-add-button';
import { fetchDiaryEntries } from '../../api/diary.api';
import type { DiaryEntrySummary } from '../../types/diary.types';

function formatDiaryTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DiarySection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [entries, setEntries] = useState<DiaryEntrySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const nextEntries = await fetchDiaryEntries();
        if (!active) {
          return;
        }
        setEntries(nextEntries);
      } catch {
        if (!active) {
          return;
        }
        setError('日记读取失败，请稍后重试。');
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

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4 bg-white px-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-[480px] rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="app-page flex min-h-[calc(var(--app-viewport-height)-96px-var(--app-safe-area-bottom))] flex-col bg-white px-4 pb-[calc(120px+var(--app-safe-area-bottom))] pt-4">
      <div className="flex items-center justify-between px-1">
        <div className="w-10" />
        <div className="text-center">
          <h1 className="text-[1.9rem] font-semibold tracking-[-0.04em] text-slate-950">日记</h1>
        </div>
        <button
          type="button"
          aria-label="切换视图"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-slate-100"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {entries && entries.length > 0 ? (
        <div className="mt-6 space-y-3">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/diary/${entry.id}`} className="block">
              <Card className="overflow-hidden rounded-[28px] border border-white/45 bg-white shadow-[0_22px_50px_-40px_rgba(15,23,42,0.28)] transition-transform duration-200 hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">{formatDiaryTime(entry.updatedAt)}</p>
                      <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-slate-800">
                        {entry.preview}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                      {entry.wordCount} 字
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <FileSearch2 className="h-12 w-12" />
          </div>
          <p className="mt-6 text-[17px] font-medium text-slate-400">您还没有日记哟</p>
          <p className="mt-2 text-sm text-slate-300">点击 + 添加</p>
        </div>
      )}

      <DiaryFloatingAddButton />
    </div>
  );
}
