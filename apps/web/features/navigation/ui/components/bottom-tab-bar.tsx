'use client';

import Link from 'next/link';
import { LayoutGroup, m } from 'motion/react';
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
    <nav
      aria-label="Bottom navigation"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-3"
    >
      <div className="pointer-events-auto w-full max-w-[375px] rounded-[30px] border border-white/50 bg-white/82 px-3 py-3 shadow-[0_22px_80px_-28px_rgba(13,148,164,0.42)] backdrop-blur-2xl">
        <LayoutGroup id="app-bottom-tabs">
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
                    'relative flex min-h-[56px] items-center justify-center overflow-hidden rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:bg-white/60 hover:text-slate-700',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive ? (
                    <m.span
                      layoutId="bottom-tab-pill"
                      className="absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,#24d3d4,#0faab7)] shadow-[0_14px_28px_-18px_rgba(15,170,183,0.9)]"
                      transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75 }}
                    />
                  ) : null}

                  <m.span
                    className="relative z-10 flex flex-col items-center gap-1"
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1 : 0.985,
                    }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                        isActive ? 'bg-white/15 text-white' : 'bg-transparent',
                      )}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                    </span>
                    <span>{tab.label}</span>
                  </m.span>
                </Link>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  );
}
