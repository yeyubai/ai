import { OnboardingFlowSection } from '@/features/onboarding-flow';

export default function OnboardingProfilePage() {
  return (
    <main className="page-shell page-shell-centered relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-100px] h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative w-full motion-enter">
        <OnboardingFlowSection />
      </div>
    </main>
  );
}
