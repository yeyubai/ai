declare module '@capacitor/core' {
  export type PluginListenerHandle = {
    remove: () => Promise<void> | void;
  };

  export const Capacitor: {
    getPlatform: () => string;
    isNativePlatform: () => boolean;
  };
}

declare module '@capacitor/app' {
  import type { PluginListenerHandle } from '@capacitor/core';

  export const App: {
    addListener: (
      eventName: string,
      listenerFunc: (...args: unknown[]) => void,
    ) => Promise<PluginListenerHandle>;
    getInfo: () => Promise<{
      name?: string;
      id?: string;
      version?: string;
      build?: string;
    }>;
  };
}

declare module '@capacitor/browser' {
  export const Browser: {
    open: (options: {
      url: string;
      windowName?: string;
    }) => Promise<void>;
  };
}

declare module '@capacitor/share' {
  export const Share: {
    canShare: () => Promise<{ value: boolean }>;
    share: (options: {
      title?: string;
      text?: string;
      url?: string;
      dialogTitle?: string;
    }) => Promise<void>;
  };
}

declare module '@capacitor/splash-screen' {
  export const SplashScreen: {
    hide: (options?: {
      fadeOutDuration?: number;
    }) => Promise<void>;
  };
}

declare module '@capacitor/status-bar' {
  export const Style: {
    Light: string;
    Dark?: string;
  };

  export const StatusBar: {
    setOverlaysWebView: (options: { overlay: boolean }) => Promise<void>;
    setStyle: (options: { style: string }) => Promise<void>;
    setBackgroundColor: (options: { color: string }) => Promise<void>;
  };
}

declare module '@aparajita/capacitor-secure-storage' {
  export const SecureStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}
