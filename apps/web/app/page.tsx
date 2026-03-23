'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/auth.store';

export default function RootPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!token && sessionStatus === 'idle') {
      void ensureGuestSession();
      return;
    }

    if (token && sessionStatus === 'ready') {
      router.replace('/home');
    }
  }, [ensureGuestSession, router, sessionStatus, token]);

  if (sessionStatus === 'error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5FBFC] px-6 text-center text-slate-900">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">连接失败</p>
          <h1 className="text-xl font-semibold">临时会话初始化没有成功</h1>
          <p className="text-sm leading-6 text-slate-600">
            请确认前端和后端本地服务已经启动，然后点击重试。
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          onClick={() => {
            void ensureGuestSession();
          }}
        >
          重新连接
        </button>
        <Link
          href="/auth/login"
          className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-4"
        >
          直接去登录页
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FBFC] px-6 text-center text-slate-600">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">正在进入应用</p>
        <p className="text-sm leading-6">
          首次启动会先创建一个临时会话，通常只需要几秒钟。
        </p>
      </div>
    </main>
  );
}
