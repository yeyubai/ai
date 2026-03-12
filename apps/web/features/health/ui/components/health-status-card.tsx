'use client';

import { useEffect } from 'react';
import { useHealthStore } from '@/features/health/model/health.store';

type Props = {
  initialStatus: {
    service: string;
    status: string;
    checkedAt: string;
  };
};

export function HealthStatusCard({ initialStatus }: Props) {
  const service = useHealthStore((state) => state.service);
  const status = useHealthStore((state) => state.status);
  const checkedAt = useHealthStore((state) => state.checkedAt);
  const setStatus = useHealthStore((state) => state.setStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus, setStatus]);

  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <h2 className="text-base font-medium">Service Health</h2>
      <p className="mt-2 text-sm">service: {service}</p>
      <p className="text-sm">status: {status}</p>
      <p className="text-xs text-slate-500">checkedAt: {checkedAt}</p>
    </article>
  );
}
