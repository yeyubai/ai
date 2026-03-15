import { DiaryEditorSection } from '@/features/diary';

export default function DiaryEntryPage({
  params,
}: {
  params: { entryId: string };
}) {
  return <DiaryEditorSection entryId={params.entryId} />;
}
