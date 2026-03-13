'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/auth.store';

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const userStatus = useAuthStore((state) => state.userStatus);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    router.replace(userStatus === 'needs_onboarding' ? '/onboarding/profile' : '/dashboard');
  }, [router, token, userStatus]);

  return null;
}
