'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function MeDetailShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-page space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          aria-label="返回我的"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm text-slate-500">我的</p>
          <h1 className="mt-1 text-[1.75rem] font-semibold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}
