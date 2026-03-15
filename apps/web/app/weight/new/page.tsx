import { Suspense } from 'react';
import { WeightEntryFormSection } from '@/features/weight-diary';

export default function NewWeightEntryPage() {
  return (
    <Suspense fallback={null}>
      <WeightEntryFormSection />
    </Suspense>
  );
}
