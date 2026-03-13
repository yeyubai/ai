import { MealCheckinSection } from '@/features/checkins';

export default function MealCheckinPage() {
  return (
    <main className="page-shell page-shell-with-tabbar flex items-start justify-center">
      <div className="w-full max-w-2xl motion-enter">
        <MealCheckinSection />
      </div>
    </main>
  );
}
