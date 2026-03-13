import { ActivityCheckinSection } from '@/features/checkins';

export default function ActivityCheckinPage() {
  return (
    <main className="page-shell page-shell-with-tabbar flex items-start justify-center">
      <div className="w-full max-w-2xl motion-enter">
        <ActivityCheckinSection />
      </div>
    </main>
  );
}
