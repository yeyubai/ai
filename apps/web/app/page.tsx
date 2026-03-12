import { HealthStatusCard } from '@/features/health';

export default function HomePage() {
  const initialStatus = {
    service: 'web',
    status: 'ok',
    checkedAt: new Date().toISOString(),
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold tracking-tight">AI Weight Coach</h1>
      <p className="mt-2 text-sm text-slate-600">
        App Router scaffold with feature-first frontend architecture.
      </p>
      <section className="mt-6">
        <HealthStatusCard initialStatus={initialStatus} />
      </section>
    </main>
  );
}
