import type { FormEvent } from 'react';
import { UserRoundPen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export type ProfileFormValues = {
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
};

export type ProfileFormErrors = {
  heightCm: string | null;
  currentWeightKg: string | null;
  targetWeightKg: string | null;
};

type Props = {
  mode: 'onboarding' | 'settings';
  phone: string | null;
  values: ProfileFormValues;
  errors: ProfileFormErrors;
  submitError: string | null;
  successMessage: string | null;
  traceId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function getTitle(mode: 'onboarding' | 'settings'): string {
  return mode === 'onboarding' ? '完善你的档案' : '编辑个人档案';
}

function getDescription(mode: 'onboarding' | 'settings'): string {
  return mode === 'onboarding'
    ? '首次使用需要先完成档案，帮助我们生成更准确的计划。'
    : '更新你的身高与体重目标，系统会基于新目标重算进度。';
}

function getSubmitLabel(mode: 'onboarding' | 'settings', isSubmitting: boolean): string {
  if (isSubmitting) {
    return '保存中...';
  }

  return mode === 'onboarding' ? '完成并继续' : '保存修改';
}

export function ProfileFormCard({
  mode,
  phone,
  values,
  errors,
  submitError,
  successMessage,
  traceId,
  isLoading,
  isSubmitting,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.14em]">
          RQ-001 / {mode === 'onboarding' ? 'FE-1.3' : 'FE-1.4'}
        </Badge>
        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
          <UserRoundPen className="h-6 w-6 text-primary" />
          {getTitle(mode)}
        </CardTitle>
        <CardDescription>{getDescription(mode)}</CardDescription>
        {phone ? <p className="text-xs text-muted-foreground">当前账号：{phone}</p> : null}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="profile-height">身高（cm）</Label>
              <Input
                id="profile-height"
                value={values.heightCm}
                onChange={(event) => onChange('heightCm', event.target.value)}
                placeholder="120 - 220"
                inputMode="numeric"
                aria-invalid={errors.heightCm !== null}
                className="bg-background/80"
              />
              {errors.heightCm ? <p className="text-xs text-destructive">{errors.heightCm}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-current-weight">当前体重（kg）</Label>
              <Input
                id="profile-current-weight"
                value={values.currentWeightKg}
                onChange={(event) => onChange('currentWeightKg', event.target.value)}
                placeholder="30 - 250"
                inputMode="decimal"
                aria-invalid={errors.currentWeightKg !== null}
                className="bg-background/80"
              />
              {errors.currentWeightKg ? (
                <p className="text-xs text-destructive">{errors.currentWeightKg}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-target-weight">目标体重（kg）</Label>
              <Input
                id="profile-target-weight"
                value={values.targetWeightKg}
                onChange={(event) => onChange('targetWeightKg', event.target.value)}
                placeholder="需小于等于当前体重"
                inputMode="decimal"
                aria-invalid={errors.targetWeightKg !== null}
                className="bg-background/80"
              />
              {errors.targetWeightKg ? (
                <p className="text-xs text-destructive">{errors.targetWeightKg}</p>
              ) : null}
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {getSubmitLabel(mode, isSubmitting)}
            </Button>
          </form>
        )}

        {submitError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}
        {successMessage ? (
          <Alert className="mt-4 border-emerald-300 bg-emerald-50 text-emerald-700">
            <AlertDescription className="text-emerald-700">{successMessage}</AlertDescription>
          </Alert>
        ) : null}
        {traceId ? <p className="mt-2 text-xs text-muted-foreground">traceId: {traceId}</p> : null}
      </CardContent>
    </Card>
  );
}
