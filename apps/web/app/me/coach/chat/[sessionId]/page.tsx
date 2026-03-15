import { CoachChatSection } from '@/features/coach';

export default function CoachChatPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return <CoachChatSection sessionId={params.sessionId} />;
}
