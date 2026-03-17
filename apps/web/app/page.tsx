'use client';

import { useEffect } from 'react';
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

  return null;
}
