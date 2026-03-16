import { notFound } from 'next/navigation';
import { MeNumberPickerSection } from '@/features/settings';
import { isMeNumberPickerField } from '@/features/settings/config/me-number-picker.config';

export default function MeNumberPickerPage({
  params,
}: {
  params: { field: string };
}) {
  if (!isMeNumberPickerField(params.field)) {
    notFound();
  }

  return <MeNumberPickerSection field={params.field} />;
}
