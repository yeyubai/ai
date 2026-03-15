'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function DiaryFloatingAddButton() {
  return (
    <Link
      href="/diary/new"
      aria-label="新增日记"
      className="fixed bottom-[calc(var(--app-tab-bar-offset)+12px)] right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#22d3d6,#0fbac1)] text-white shadow-[0_18px_40px_-18px_rgba(15,185,196,0.95)] transition-transform hover:scale-[1.02]"
    >
      <Plus className="h-8 w-8" />
    </Link>
  );
}
