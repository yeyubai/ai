import { WeightCheckinSection } from '@/features/checkins';

export default function WeightCheckinPage() {
  return (
    <main className="page-shell page-shell-with-tabbar flex items-start justify-center">
      <div className="w-full max-w-2xl motion-enter">
        <WeightCheckinSection />
      </div>
    </main>
  );
}
