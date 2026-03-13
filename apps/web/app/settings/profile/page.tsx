import { ProfileEditorSection } from '@/features/profile';

export default function SettingsProfilePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-12">
      <ProfileEditorSection mode="settings" />
    </main>
  );
}
