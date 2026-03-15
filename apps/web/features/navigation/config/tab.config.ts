'use client';

import { BookOpenText, ChartSpline, House, UserRound } from 'lucide-react';
import type { TabItem, TabKey } from '../types/tab.types';

export const APP_TABS: TabItem[] = [
  {
    key: 'home',
    label: '首页',
    icon: House,
    href: '/home',
    matchPrefixes: ['/home'],
  },
  {
    key: 'trend',
    label: '趋势',
    icon: ChartSpline,
    href: '/trend',
    matchPrefixes: ['/trend'],
  },
  {
    key: 'diary',
    label: '日记',
    icon: BookOpenText,
    href: '/diary',
    matchPrefixes: ['/diary', '/weight'],
  },
  {
    key: 'me',
    label: '我的',
    icon: UserRound,
    href: '/me',
    matchPrefixes: ['/me'],
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
