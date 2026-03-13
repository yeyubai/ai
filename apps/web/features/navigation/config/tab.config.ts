'use client';

import { ClipboardCheck, House, LineChart, UserRound } from 'lucide-react';
import type { TabItem, TabKey } from '../types/tab.types';

export const APP_TABS: TabItem[] = [
  {
    key: 'home',
    label: '首页',
    icon: House,
    href: '/dashboard',
    matchPrefixes: ['/dashboard', '/coach'],
  },
  {
    key: 'checkins',
    label: '记录',
    icon: ClipboardCheck,
    href: '/checkins',
    matchPrefixes: ['/checkins'],
  },
  {
    key: 'trend',
    label: '进度',
    icon: LineChart,
    href: '/trend',
    matchPrefixes: ['/trend'],
  },
  {
    key: 'me',
    label: '我的',
    icon: UserRound,
    href: '/settings/preferences',
    matchPrefixes: ['/settings'],
  },
];

export function resolveActiveTabKey(pathname: string): TabKey | null {
  let matched: { key: TabKey; prefixLength: number } | null = null;

  for (const tab of APP_TABS) {
    for (const prefix of tab.matchPrefixes) {
      if (!pathname.startsWith(prefix)) {
        continue;
      }

      if (!matched || prefix.length > matched.prefixLength) {
        matched = {
          key: tab.key,
          prefixLength: prefix.length,
        };
      }
    }
  }

  return matched?.key ?? null;
}
