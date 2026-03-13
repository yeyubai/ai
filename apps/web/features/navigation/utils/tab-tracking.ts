'use client';

import type { TabTrackingEventName, TabTrackingPayload } from '../types/tab.types';

declare global {
  interface WindowEventMap {
    tab_impression: CustomEvent<TabTrackingPayload>;
    tab_click: CustomEvent<TabTrackingPayload>;
  }
}

export function trackTabEvent(eventName: TabTrackingEventName, payload: TabTrackingPayload): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
}
