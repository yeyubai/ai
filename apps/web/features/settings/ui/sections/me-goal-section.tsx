'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchGoal, updateGoal } from '../../api/me.api';
import type { WeightGoal } from '../../types/settings.types';
import { MeDetailShell } from '../components/me-detail-shell';

export function MeGoalSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const nextGoal = await fetchGoal();
        if (active) {
          setGoal(nextGoal);
        }
      } catch {
        if (active) {
          setError('目标设置加载失败，请稍后重试。');
        }
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goal?.startWeightKg || !goal?.targetWeightKg) {
      setError('请先补齐当前体重和目标体重。');
      return;
    }

    try {
      setIsSubmitting(true);
      const nextGoal = await updateGoal({
        startWeightKg: goal.startWeightKg,
        targetWeightKg: goal.targetWeightKg,
        targetDate: goal.targetDate ?? undefined,
        weightUnit: goal.weightUnit,
      });
      setGoal(nextGoal);
      setMessage('目标设置已保存。');
      setError(null);
    } catch {
      setError('保存目标失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[300px] rounded-[30px]" />
      </div>
    );
  }

  if (!goal) {
    return (
      <MeDetailShell title="目标与体重" description="设置你的起点、目标和单位。">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '目标设置暂时不可用。'}</AlertDescription>
        </Alert>
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="目标与体重" description="这里决定趋势页和首页的参考方向。">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900">体重目标</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>当前体重</Label>
                <Input
                  value={goal.startWeightKg ?? ''}
                  inputMode="decimal"
                  onChange={(event) =>
                    setGoal((current) =>
                      current
                        ? {
                            ...current,
                            startWeightKg: event.target.value ? Number(event.target.value) : null,
                          }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>目标体重</Label>
                <Input
                  value={goal.targetWeightKg ?? ''}
                  inputMode="decimal"
                  onChange={(event) =>
                    setGoal((current) =>
                      current
                        ? {
                            ...current,
                            targetWeightKg: event.target.value ? Number(event.target.value) : null,
                          }
                        : current,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>单位</Label>
              <Select
                value={goal.weightUnit}
                onValueChange={(value) =>
                  setGoal((current) =>
                    current ? { ...current, weightUnit: value as WeightGoal['weightUnit'] } : current,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">公斤</SelectItem>
                  <SelectItem value="lb">磅</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存目标'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </MeDetailShell>
  );
}
