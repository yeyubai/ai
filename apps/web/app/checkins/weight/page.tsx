import { redirect } from 'next/navigation';

export default function LegacyWeightPage() {
  redirect('/weight/new');
}
