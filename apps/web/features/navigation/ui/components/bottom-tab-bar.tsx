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
    <nav aria-label="底部主导航" className="fixed inset-x-0 bottom-0 z-40 px-5 pb-4">
      <div className="mx-auto w-full max-w-md rounded-[30px] border border-white/35 bg-white/75 px-3 py-3 shadow-[0_20px_80px_-28px_rgba(13,148,164,0.55)] backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-2 pb-[max(env(safe-area-inset-bottom),0px)]">
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
                  'flex min-h-14 items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all',
                  isActive
                    ? 'bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-white shadow-[0_14px_28px_-18px_rgba(15,170,183,0.9)]'
                    : 'text-slate-400 hover:bg-white/60 hover:text-slate-700',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-white/15 text-white' : 'bg-transparent',
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
