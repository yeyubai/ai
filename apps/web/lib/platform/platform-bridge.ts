import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export type PlatformShareData = {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
};

export type PlatformAppInfo = {
  name: string | null;
  id: string | null;
  version: string | null;
  build: string | null;
  platform: 'web' | 'android' | 'ios' | 'unknown';
  isNative: boolean;
};

export type PlatformBridge = {
  isNative: () => boolean;
  share: (data: PlatformShareData) => Promise<boolean>;
  openExternalUrl: (url: string) => Promise<void>;
  getAppInfo: () => Promise<PlatformAppInfo>;
};

function resolvePlatform(): PlatformAppInfo['platform'] {
  const platform = Capacitor.getPlatform();

  if (platform === 'android' || platform === 'ios' || platform === 'web') {
    return platform;
  }

  return 'unknown';
}

function resolveNativeState(): boolean {
  return Capacitor.isNativePlatform();
}

function buildWebAppInfo(): PlatformAppInfo {
  return {
    name: 'AI Weight Coach',
    id: null,
    version: null,
    build: null,
    platform: 'web',
    isNative: false,
  };
}

async function shareWithBrowserFallback(data: PlatformShareData): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false;
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }

  const copyCandidate = [data.title, data.text, data.url].filter(Boolean).join('\n');
  if (copyCandidate && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(copyCandidate);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export const platformBridge: PlatformBridge = {
  isNative() {
    return resolveNativeState();
  },
  async share(data) {
    try {
      const support = await Share.canShare();
      if (support.value) {
        await Share.share(data);
        return true;
      }
    } catch {
      return shareWithBrowserFallback(data);
    }

    return shareWithBrowserFallback(data);
  },
  async openExternalUrl(url) {
    try {
      await Browser.open({
        url,
        windowName: '_blank',
      });
    } catch {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  },
  async getAppInfo() {
    const platform = resolvePlatform();
    const isNative = resolveNativeState();

    if (isNative) {
      try {
        const info = await App.getInfo();
        return {
          name: info.name ?? 'AI Weight Coach',
          id: info.id ?? null,
          version: info.version ?? null,
          build: info.build ?? null,
          platform,
          isNative,
        };
      } catch {
        return {
          ...buildWebAppInfo(),
          platform,
          isNative,
        };
      }
    }

    return {
      ...buildWebAppInfo(),
      platform: platform === 'unknown' ? 'web' : platform,
      isNative,
    };
  },
};
