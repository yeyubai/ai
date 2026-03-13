'use client';

import { type ReactNode, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { APP_TABS, resolveActiveTabKey } from '../../config/tab.config';
import { trackTabEvent } from '../../utils/tab-tracking';
import { BottomTabBar } from './bottom-tab-bar';

type Props = {
  children: ReactNode;
};

const TAB_HIDDEN_PREFIXES = ['/auth', '/onboarding'];

function shouldShowTabBar(pathname: string, token: string | null): boolean {
  if (!token) {
    return false;
  }

  return !TAB_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);

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

  if (!isTabBarVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_120%,hsl(177_72%_72%/.18),transparent_60%)]" />
      <div className="relative pb-[calc(98px+env(safe-area-inset-bottom))]">{children}</div>
      <BottomTabBar tabs={APP_TABS} activeTabKey={activeTabKey} pathname={pathname} />
    </div>
  );
}
