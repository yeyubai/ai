'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/model/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loginError = useAuthStore((state) => state.loginError);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.userRole);
  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('123456');

  useEffect(() => {
    if (!token || userRole === 'guest') {
      return;
    }

    router.replace('/home');
  }, [router, token, userRole]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login({ phone, code });
    if (!success) {
      return;
    }

    router.replace('/home');
  };

  return (
    <div className="page-shell-centered">
      <Card className="glass-card w-full max-w-md overflow-hidden">
        <CardContent className="space-y-6 p-6">
          <div className="hero-panel p-6">
            <p className="section-eyebrow">体重日记</p>
            <h1 className="mt-4 text-4xl font-semibold">回到你的记录里</h1>
            <p className="mt-3 text-sm leading-6 text-white/80">
              当前支持游客直接使用。登录后会把游客期间的记录、目标和设置同步到正式账号。
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} />
            </div>
            <Button
              type="submit"
              className="h-12 w-full justify-between rounded-2xl bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-white hover:opacity-95"
              disabled={loginStatus === 'loading'}
            >
              {loginStatus === 'loading' ? '正在登录...' : '进入体重日记'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {loginError ? (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
