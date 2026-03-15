'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Scale } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { completeOnboarding } from '../../api/onboarding.api';
import type { OnboardingValues } from '../../types/onboarding.types';

const defaultValues: OnboardingValues = {
  startWeightKg: '68.8',
  targetWeightKg: '60',
  heightCm: '170',
  weightUnit: 'kg',
};

export function OnboardingSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const userStatus = useAuthStore((state) => state.userStatus);
  const setUserStatus = useAuthStore((state) => state.setUserStatus);
  const [values, setValues] = useState<OnboardingValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (userStatus === 'active') {
      router.replace('/home');
    }
  }, [router, token, userStatus]);

  if (!token || userStatus === 'active') {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await completeOnboarding({
        startWeightKg: Number(values.startWeightKg),
        targetWeightKg: Number(values.targetWeightKg),
        heightCm: Number(values.heightCm),
        weightUnit: values.weightUnit,
      });
      setUserStatus('active');
      router.replace('/home');
    } catch (nextError) {
      setError(isApiError(nextError) ? nextError.message : '初始化失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell-centered">
      <Card className="glass-card w-full max-w-md overflow-hidden">
        <CardHeader className="hero-panel p-6">
          <div className="info-chip w-fit">轻量初始化</div>
          <CardTitle className="mt-4 flex items-center gap-3 text-3xl text-white">
            <Scale className="h-7 w-7" />
            先建好你的体重日记
          </CardTitle>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
            首版只保留最必要的四个信息，让你先记录、先看到变化，再慢慢补资料。
          </p>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startWeightKg">当前体重</Label>
                <Input
                  id="startWeightKg"
                  value={values.startWeightKg}
                  inputMode="decimal"
                  onChange={(event) =>
                    setValues((current) => ({ ...current, startWeightKg: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeightKg">目标体重</Label>
                <Input
                  id="targetWeightKg"
                  value={values.targetWeightKg}
                  inputMode="decimal"
                  onChange={(event) =>
                    setValues((current) => ({ ...current, targetWeightKg: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heightCm">身高</Label>
                <Input
                  id="heightCm"
                  value={values.heightCm}
                  inputMode="numeric"
                  onChange={(event) =>
                    setValues((current) => ({ ...current, heightCm: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Select
                  value={values.weightUnit}
                  onValueChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      weightUnit: value as OnboardingValues['weightUnit'],
                    }))
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
            </div>

            <div className="rounded-[26px] bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
              新版本以“体重日记”为中心：先记录、看趋势、管理目标；运动、AI 和同步能力都放到后续版本。
            </div>

            <Button
              type="submit"
              className="h-12 w-full justify-between rounded-2xl bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-white hover:opacity-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? '正在进入体重日记...' : '开始记录'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
