'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/auth.store';

export default function RootPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);

  useEffect(() => {
    if (!token) {
      void ensureGuestSession();
      return;
    }

    router.replace('/home');
  }, [ensureGuestSession, router, token]);

  return null;
}
