import type { LucideIcon } from 'lucide-react';

export type TabKey = 'home' | 'trend' | 'diary' | 'me';

export type TabItem = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  href: string;
  matchPrefixes: string[];
};

export type TabTrackingPayload = {
  tab_key: TabKey;
  from_path: string;
  to_path: string;
  is_active_reclick: boolean;
};

export type TabTrackingEventName = 'tab_impression' | 'tab_click';
