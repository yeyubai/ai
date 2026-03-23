'use client';

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';

const NATIVE_STATUS_BAR_COLOR = '#F5FBFC';
const KEYBOARD_INSET_THRESHOLD_PX = 120;
const FOCUS_RESYNC_DELAY_MS = 120;
type AppListenerHandle = Awaited<ReturnType<typeof App.addListener>>;
type NativePlatform = 'android' | 'ios';
type NativeViewportSyncController = {
  sync: () => void;
  cleanup: () => void;
  setKeyboardInset: (height: number) => void;
};

function isSupportedNativePlatform(platform: string): platform is NativePlatform {
  return platform === 'android' || platform === 'ios';
}

function isKeyboardFocusableElement(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element.isContentEditable) {
    return true;
  }

  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit'].includes(
      element.type,
    );
  }

  return false;
}

function applyNativeDocumentState(platform: NativePlatform) {
  const root = document.documentElement;

  root.dataset.nativeShell = 'true';
  root.dataset.nativePlatform = platform;
}

function clearNativeDocumentState() {
  const root = document.documentElement;

  delete root.dataset.nativeShell;
  delete root.dataset.nativePlatform;
  delete root.dataset.nativeKeyboardVisible;
  root.style.removeProperty('--app-viewport-height');
  root.style.removeProperty('--native-keyboard-inset');
}

function createNativeViewportSyncController(): NativeViewportSyncController {
  if (typeof window === 'undefined') {
    return {
      sync: () => undefined,
      cleanup: () => undefined,
      setKeyboardInset: () => undefined,
    };
  }

  const root = document.documentElement;
  const visualViewport = window.visualViewport;
  let baselineViewportHeight = 0;
  let pluginKeyboardInset = 0;
  let frameId: number | null = null;
  let focusTimeoutId: number | null = null;

  const readViewportHeight = () =>
    Math.round(visualViewport ? visualViewport.height + visualViewport.offsetTop : window.innerHeight);

  const syncNow = () => {
    const viewportHeight = readViewportHeight();
    const keyboardTargetFocused = isKeyboardFocusableElement(document.activeElement);

    if (!keyboardTargetFocused) {
      baselineViewportHeight = Math.max(baselineViewportHeight, viewportHeight);
    } else if (baselineViewportHeight === 0) {
      baselineViewportHeight = viewportHeight;
    }

    const rawKeyboardInset = Math.max(0, baselineViewportHeight - viewportHeight);
    const derivedKeyboardInset =
      rawKeyboardInset > KEYBOARD_INSET_THRESHOLD_PX ? rawKeyboardInset : 0;
    const keyboardInset = Math.max(pluginKeyboardInset, derivedKeyboardInset);

    root.style.setProperty('--app-viewport-height', `${viewportHeight}px`);
    root.style.setProperty('--native-keyboard-inset', `${keyboardInset}px`);
    root.dataset.nativeKeyboardVisible = keyboardInset > 0 ? 'true' : 'false';
  };

  const scheduleSync = () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      syncNow();
    });
  };

  const handleFocusOut = () => {
    if (focusTimeoutId !== null) {
      window.clearTimeout(focusTimeoutId);
    }

    focusTimeoutId = window.setTimeout(() => {
      focusTimeoutId = null;
      scheduleSync();
    }, FOCUS_RESYNC_DELAY_MS);
  };

  scheduleSync();

  visualViewport?.addEventListener('resize', scheduleSync);
  visualViewport?.addEventListener('scroll', scheduleSync);
  window.addEventListener('resize', scheduleSync);
  window.addEventListener('orientationchange', scheduleSync);
  window.addEventListener('focusin', scheduleSync);
  window.addEventListener('focusout', handleFocusOut);

  return {
    sync: scheduleSync,
    setKeyboardInset: (height: number) => {
      pluginKeyboardInset = Math.max(0, Math.round(height));
      scheduleSync();
    },
    cleanup: () => {
      visualViewport?.removeEventListener('resize', scheduleSync);
      visualViewport?.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('orientationchange', scheduleSync);
      window.removeEventListener('focusin', scheduleSync);
      window.removeEventListener('focusout', handleFocusOut);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (focusTimeoutId !== null) {
        window.clearTimeout(focusTimeoutId);
      }
    },
  };
}

function createNativeKeyboardSyncController(
  platform: NativePlatform,
  viewportSyncController: NativeViewportSyncController,
) {
  let disposed = false;
  const listenerHandles: AppListenerHandle[] = [];
  const attachListener = (promise: Promise<AppListenerHandle>) => {
    void promise.then((handle) => {
      if (disposed) {
        void handle.remove();
        return;
      }

      listenerHandles.push(handle);
    }).catch(() => {
      // Keyboard plugin listeners are a best-effort enhancement over visualViewport fallback.
    });
  };

  const registerShowListener = () => {
    const onShow = (info: { keyboardHeight: number }) => {
      viewportSyncController.setKeyboardInset(info.keyboardHeight);
    };

    if (platform === 'ios') {
      attachListener(Keyboard.addListener('keyboardWillShow', onShow));
      return;
    }

    attachListener(Keyboard.addListener('keyboardDidShow', onShow));
  };

  const registerHideListener = () => {
    const onHide = () => {
      viewportSyncController.setKeyboardInset(0);
    };

    if (platform === 'ios') {
      attachListener(Keyboard.addListener('keyboardWillHide', onHide));
      return;
    }

    attachListener(Keyboard.addListener('keyboardDidHide', onHide));
  };

  registerShowListener();
  registerHideListener();

  return {
    cleanup: () => {
      disposed = true;
      viewportSyncController.setKeyboardInset(0);
      listenerHandles.forEach((handle) => {
        void handle.remove();
      });
    },
  };
}

async function applyNativeShellChrome(platform: NativePlatform) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Some Android/iOS versions may ignore overlay configuration.
  }

  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Some Android/iOS environments may not support status bar styling.
  }

  if (platform === 'android') {
    try {
      await StatusBar.setBackgroundColor({ color: NATIVE_STATUS_BAR_COLOR });
    } catch {
      // Background color is Android-only in our current shell strategy.
    }
  }
}

async function hideNativeSplash() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 180 });
  } catch {
    // If the splash is already hidden, we can safely ignore the error.
  }
}

export function NativeShellController() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const platform = Capacitor.getPlatform();
    if (!isSupportedNativePlatform(platform)) {
      return;
    }

    applyNativeDocumentState(platform);

    const viewportSyncController = createNativeViewportSyncController();
    const keyboardSyncController = createNativeKeyboardSyncController(
      platform,
      viewportSyncController,
    );

    void applyNativeShellChrome(platform);
    void hideNativeSplash();

    let listener: AppListenerHandle | null = null;

    void App.addListener('resume', () => {
      viewportSyncController.sync();
      void applyNativeShellChrome(platform);
    }).then((handle: AppListenerHandle) => {
      listener = handle;
    });

    return () => {
      keyboardSyncController.cleanup();
      viewportSyncController.cleanup();
      clearNativeDocumentState();
      void listener?.remove();
    };
  }, []);

  return null;
}
