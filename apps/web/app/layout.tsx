import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { AppShell } from '@/features/navigation';
import { cn } from '@/lib/utils';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: '日常减脂教练',
  description: '面向反复减脂失败者的科学减脂陪伴服务',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={cn('font-sans')}>
      <body className={cn(manrope.variable, spaceGrotesk.variable, 'min-h-screen font-sans')}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
