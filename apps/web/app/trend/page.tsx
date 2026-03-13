import { ProgressInsightSection } from '@/features/progress-insight';

export default function TrendPage() {
  return (
    <main className="page-shell page-shell-with-tabbar relative flex items-start justify-center overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-100px] h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative w-full max-w-6xl motion-enter">
        <ProgressInsightSection />
      </div>
    </main>
  );
}
