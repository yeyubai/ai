import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/features/navigation';
import { NativeShellController } from '@/shared/native-shell/native-shell-controller';
import { cn } from '@/lib/utils';
import packageJson from '../package.json';
import './globals.css';

export const metadata: Metadata = {
  title: '体重日记',
  description: '面向移动端的体重记录、趋势查看与轻量目标管理应用',
  other: {
    'ai-web-app-version': packageJson.version,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={cn('font-sans')}>
      <body className={cn('font-sans')}>
        <NativeShellController />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
