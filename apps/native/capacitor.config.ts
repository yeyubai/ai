import 'dotenv/config';
import type { CapacitorConfig } from '@capacitor/cli';

type NativeAppMode = 'debug' | 'test' | 'release';

function resolveAppMode(): NativeAppMode {
  const mode = process.env.NATIVE_APP_MODE?.trim().toLowerCase();

  if (mode === 'test' || mode === 'release') {
    return mode;
  }

  return 'debug';
}

function normalizeUrl(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function resolveWebAppUrl(mode: NativeAppMode): string | null {
  if (mode === 'release') {
    return normalizeUrl(process.env.NATIVE_RELEASE_WEB_APP_URL);
  }

  return normalizeUrl(process.env.NATIVE_WEB_APP_URL);
}

function buildServerConfig(mode: NativeAppMode): CapacitorConfig['server'] {
  const webAppUrl = resolveWebAppUrl(mode);
  if (!webAppUrl) {
    return undefined;
  }

  if (mode === 'release') {
    if (!webAppUrl.startsWith('https://')) {
      throw new Error(
        'release 模式要求 NATIVE_RELEASE_WEB_APP_URL 使用 https://，且不能继续依赖调试服务器地址。',
      );
    }

    return {
      url: webAppUrl,
      cleartext: false,
    };
  }

  return {
    url: webAppUrl,
    cleartext: webAppUrl.startsWith('http://'),
  };
}

const appMode = resolveAppMode();

const config: CapacitorConfig = {
  appId: process.env.NATIVE_APP_ID ?? 'com.aiweightcoach.android',
  appName: process.env.NATIVE_APP_NAME ?? 'AI Weight Coach',
  webDir: 'web',
  server: buildServerConfig(appMode),
};

export default config;
