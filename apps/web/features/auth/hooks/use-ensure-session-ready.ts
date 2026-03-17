'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../model/auth.store';

export function useEnsureSessionReady(enabled = true) {
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);

  useEffect(() => {
    if (!enabled || sessionStatus !== 'idle') {
      return;
    }

    void ensureGuestSession();
  }, [enabled, ensureGuestSession, sessionStatus]);
}
