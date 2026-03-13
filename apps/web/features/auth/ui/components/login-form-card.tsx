import type { FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  phone: string;
  code: string;
  phoneError: string | null;
  codeError: string | null;
  submitError: string | null;
  traceId: string | null;
  isSubmitting: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginFormCard({
  phone,
  code,
  phoneError,
  codeError,
  submitError,
  traceId,
  isSubmitting,
  onPhoneChange,
  onCodeChange,
  onSubmit,
}: Props) {
  return (
    <Card className="mx-auto w-full max-w-md border-border/70 bg-card/90 shadow-xl shadow-slate-950/10 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/75 to-accent/60">
        <Badge variant="secondary" className="w-fit">
          AI Weight Coach
        </Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <ShieldCheck className="h-6 w-6 text-primary" />
          手机号登录
        </CardTitle>
        <CardDescription>请输入手机号和验证码继续。</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert className="border-primary/25 bg-primary/10">
          <AlertDescription className="text-foreground">
            测试账号：`13800138000`，测试验证码：`123456`
          </AlertDescription>
        </Alert>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="login-phone">手机号</Label>
            <Input
              id="login-phone"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="例如 13800138000"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={11}
              aria-invalid={phoneError !== null}
              className="bg-background/80"
            />
            {phoneError ? <p className="text-xs text-destructive">{phoneError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-code">验证码</Label>
            <Input
              id="login-code"
              value={code}
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder="6 位数字"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              aria-invalid={codeError !== null}
              className="bg-background/80"
            />
            {codeError ? <p className="text-xs text-destructive">{codeError}</p> : null}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? '登录中...' : '登录并继续'}
          </Button>
        </form>

        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}
        {traceId ? <p className="text-xs text-muted-foreground">traceId: {traceId}</p> : null}
      </CardContent>
    </Card>
  );
}
