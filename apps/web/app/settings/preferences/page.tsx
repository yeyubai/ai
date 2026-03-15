import { redirect } from 'next/navigation';

export default function LegacyPreferencesPage() {
  redirect('/me');
}
