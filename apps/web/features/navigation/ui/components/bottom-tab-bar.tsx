'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { TabItem, TabKey } from '../../types/tab.types';
import { trackTabEvent } from '../../utils/tab-tracking';

type Props = {
  tabs: TabItem[];
  activeTabKey: TabKey | null;
  pathname: string;
};

export function BottomTabBar({ tabs, activeTabKey, pathname }: Props) {
  return (
    <nav aria-label="底部主导航" className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-border/70 bg-card/92 p-2 shadow-2xl shadow-slate-950/15 backdrop-blur-xl motion-enter">
        <div className="grid grid-cols-4 gap-1 pb-[max(env(safe-area-inset-bottom),0px)]">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTabKey;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={() => {
                  trackTabEvent('tab_click', {
                    tab_key: tab.key,
                    from_path: pathname,
                    to_path: tab.href,
                    is_active_reclick: isActive,
                  });
                }}
                className={cn(
                  'flex min-h-12 items-center justify-center rounded-xl px-2 py-2 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-primary/15 text-primary' : 'bg-transparent',
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  </span>
                  <span>{tab.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
