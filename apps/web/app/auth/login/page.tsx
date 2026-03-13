import { LoginPageSection } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-100 to-transparent" />
      <LoginPageSection />
    </main>
  );
}
