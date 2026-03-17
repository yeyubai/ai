'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEnsureSessionReady } from '@/features/auth/hooks/use-ensure-session-ready';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { APP_TABS, resolveActiveTabKey } from '../../config/tab.config';
import { trackTabEvent } from '../../utils/tab-tracking';
import { BottomTabBar } from './bottom-tab-bar';
import { RouteTransitionShell } from './route-transition-shell';

type Props = {
  children: ReactNode;
};

const TAB_HIDDEN_PREFIXES = ['/auth', '/onboarding'];
const TAB_BAR_OFFSET = '106px';

function shouldShowTabBar(pathname: string, token: string | null): boolean {
  if (!token) {
    return false;
  }

  if (TAB_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return APP_TABS.some((tab) => pathname === tab.href);
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);

  useEnsureSessionReady(!pathname.startsWith('/auth'));

  const isTabBarVisible = useMemo(
    () => shouldShowTabBar(pathname, token),
    [pathname, token],
  );

  const activeTabKey = useMemo(() => {
    if (!isTabBarVisible) {
      return null;
    }

    return resolveActiveTabKey(pathname);
  }, [isTabBarVisible, pathname]);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      if (!pathname.startsWith('/auth')) {
        void ensureGuestSession();
      }
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [ensureGuestSession, logout, pathname]);

  useEffect(() => {
    if (!isTabBarVisible || !activeTabKey) {
      return;
    }

    trackTabEvent('tab_impression', {
      tab_key: activeTabKey,
      from_path: pathname,
      to_path: pathname,
      is_active_reclick: true,
    });
  }, [activeTabKey, isTabBarVisible, pathname]);

  const pageContent = (
    <RouteTransitionShell pathname={pathname}>
      {children}
    </RouteTransitionShell>
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        {!isTabBarVisible ? (
          pageContent
        ) : (
          <div
            className="relative min-h-screen"
            style={
              {
                '--app-tab-bar-offset': `calc(${TAB_BAR_OFFSET} + env(safe-area-inset-bottom))`,
              } as CSSProperties
            }
          >
            <div className="relative pb-[var(--app-tab-bar-offset)]">{pageContent}</div>
            <BottomTabBar tabs={APP_TABS} activeTabKey={activeTabKey} pathname={pathname} />
          </div>
        )}
      </MotionConfig>
    </LazyMotion>
  );
}
