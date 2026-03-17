import 'dotenv/config';
import type { CapacitorConfig } from '@capacitor/cli';

const webAppUrl = process.env.NATIVE_WEB_APP_URL?.trim();

const config: CapacitorConfig = {
  appId: process.env.NATIVE_APP_ID ?? 'com.aiweightcoach.android',
  appName: process.env.NATIVE_APP_NAME ?? 'AI Weight Coach',
  webDir: 'web',
  server: webAppUrl
    ? {
        url: webAppUrl,
        cleartext: webAppUrl.startsWith('http://'),
      }
    : undefined,
};

export default config;
