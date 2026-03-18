'use client';

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';

const NATIVE_STATUS_BAR_COLOR = '#F5FBFC';
type AppListenerHandle = Awaited<ReturnType<typeof App.addListener>>;

async function applyNativeShellChrome() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Android 15+ may ignore overlay configuration; safe to continue.
  }

  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Some web/native environments may not support status bar styling.
  }

  try {
    await StatusBar.setBackgroundColor({ color: NATIVE_STATUS_BAR_COLOR });
  } catch {
    // Background color is not available on every Android version.
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

    void applyNativeShellChrome();
    void hideNativeSplash();

    let listener: AppListenerHandle | null = null;

    void App.addListener('resume', () => {
      void applyNativeShellChrome();
    }).then((handle: AppListenerHandle) => {
      listener = handle;
    });

    return () => {
      void listener?.remove();
    };
  }, []);

  return null;
}
