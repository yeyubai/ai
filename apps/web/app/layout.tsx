import type { Metadata } from 'next';
import { AppShell } from '@/features/navigation';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: '体重日记',
  description: '面向移动端的体重记录、趋势查看与轻量目标管理应用',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={cn('font-sans')}>
      <body className={cn('min-h-screen font-sans')}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
