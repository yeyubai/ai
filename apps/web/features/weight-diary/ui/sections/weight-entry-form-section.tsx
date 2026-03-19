'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/model/auth.store';
import {
  createWeightEntry,
  deleteWeightEntry,
  fetchWeightEntry,
  updateWeightEntry,
} from '../../api/weights.api';

function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function toTimeString(value: string): string {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function WeightEntryFormSection({ entryId }: { entryId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const isEdit = Boolean(entryId);
  const from = searchParams.get('from') ?? 'diary';
  const [entryDate, setEntryDate] = useState(getTodayDateString());
  const [time, setTime] = useState('08:00');
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router, token]);

  useEffect(() => {
    if (!entryId) {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const nextEntry = await fetchWeightEntry(entryId);
        if (!active) {
          return;
        }
        setEntryDate(nextEntry.entryDate);
        setTime(toTimeString(nextEntry.measuredAt));
        setWeightKg(nextEntry.weightKg.toString());
        setBodyFatPct(nextEntry.ranges.bodyFat.estimated ? '' : nextEntry.estimatedBodyFatPct?.toString() ?? '');
        setNote(nextEntry.note ?? '');
      } catch {
        if (!active) {
          return;
        }
        setError('记录加载失败，请稍后重试。');
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

  const backHref = useMemo(() => {
    if (from === 'home') {
      return '/home';
    }
    return '/diary';
  }, [from]);

  const measuredAt = `${entryDate}T${time}:00+08:00`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        entryDate,
        measuredAt,
        weightKg: Number(weightKg),
        bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
        note: note.trim() || undefined,
      };

      if (entryId) {
        await updateWeightEntry(entryId, payload);
      } else {
        await createWeightEntry(payload);
      }

      router.replace(backHref);
    } catch {
      setError('保存失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entryId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteWeightEntry(entryId);
      router.replace('/diary');
    } catch {
      setError('删除失败，请稍后重试。');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-[420px] rounded-[30px]" />
      </div>
    );
  }

  return (
    <div className="app-page flex min-h-[calc(var(--app-viewport-height)-var(--app-tab-bar-offset))] flex-col space-y-4 pb-[calc(1.75rem+var(--app-safe-area-bottom)+var(--native-keyboard-inset))]">
      <div>
        <p className="text-sm text-slate-500">{isEdit ? '编辑记录' : '新增记录'}</p>
        <h1 className="mt-1 text-4xl font-semibold text-slate-950">
          {isEdit ? '修改这条体重日记' : '记下今天的体重'}
        </h1>
      </div>

      <Card className="glass-card border-none">
        <CardContent className="space-y-4 p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>日期</Label>
                <Input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>时间</Label>
                <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>体重（kg）</Label>
              <Input value={weightKg} inputMode="decimal" onChange={(event) => setWeightKg(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>体脂（可选）</Label>
              <Input value={bodyFatPct} inputMode="decimal" onChange={(event) => setBodyFatPct(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>备注（可选）</Label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
                {isSubmitting ? '保存中...' : '保存记录'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => router.replace(backHref)}
              >
                取消
              </Button>
              {isEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl text-destructive"
                  onClick={() => void handleDelete()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
