import { RecordCenterSection } from '@/features/checkins';

export default function CheckinsPage() {
  return (
    <main className="page-shell page-shell-with-tabbar flex items-start justify-center">
      <div className="w-full max-w-5xl motion-enter">
        <RecordCenterSection />
      </div>
    </main>
  );
}
