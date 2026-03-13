import { SleepCheckinSection } from '@/features/checkins';

export default function SleepCheckinPage() {
  return (
    <main className="page-shell page-shell-with-tabbar flex items-start justify-center">
      <div className="w-full max-w-2xl motion-enter">
        <SleepCheckinSection />
      </div>
    </main>
  );
}
