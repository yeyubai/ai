import type { FormEvent, ReactNode } from 'react';
import { CalendarClock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  title: string;
  description: string;
  isBackfill: boolean;
  checkinDate: string;
  minDate: string;
  maxDate: string;
  isSubmitting: boolean;
  submitLabel: string;
  submitError: string | null;
  successMessage: string | null;
  traceId: string | null;
  onBackfillChange: (value: boolean) => void;
  onCheckinDateChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  afterForm?: ReactNode;
};

export function CheckinFormLayout({
  title,
  description,
  isBackfill,
  checkinDate,
  minDate,
  maxDate,
  isSubmitting,
  submitLabel,
  submitError,
  successMessage,
  traceId,
  onBackfillChange,
  onCheckinDateChange,
  onSubmit,
  children,
  afterForm,
}: Props) {
  return (
    <Card className="w-full border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.14em]">
          记录中心
        </Badge>
        <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
          <CalendarClock className="h-6 w-6 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pb-[calc(1.25rem+var(--app-safe-area-bottom)+var(--native-keyboard-inset))]">
        <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="checkin-backfill"
                checked={isBackfill}
                onCheckedChange={(checked) => onBackfillChange(Boolean(checked))}
              />
              <Label htmlFor="checkin-backfill" className="text-sm">
                补录模式（最近 7 天）
              </Label>
            </div>

            {isBackfill ? <Badge variant="secondary">当前为补录模式</Badge> : null}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="checkin-date">打卡日期</Label>
            <Input
              id="checkin-date"
              type="date"
              value={checkinDate}
              min={minDate}
              max={maxDate}
              disabled={!isBackfill}
              onChange={(event) => onCheckinDateChange(event.target.value)}
              className="bg-background/85"
            />
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {children}

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : submitLabel}
          </Button>
        </form>

        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}
        {successMessage ? (
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-700">
            <AlertDescription className="text-emerald-700">{successMessage}</AlertDescription>
          </Alert>
        ) : null}
        {traceId ? <p className="text-xs text-muted-foreground">traceId: {traceId}</p> : null}
        {afterForm}
      </CardContent>
    </Card>
  );
}
