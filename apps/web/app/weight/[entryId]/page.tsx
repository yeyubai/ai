import { Suspense } from 'react';
import { WeightEntryDetailSection } from '@/features/weight-diary';

export default function WeightEntryPage({
  params,
}: {
  params: { entryId: string };
}) {
  return (
    <Suspense fallback={null}>
      <WeightEntryDetailSection entryId={params.entryId} />
    </Suspense>
  );
}
