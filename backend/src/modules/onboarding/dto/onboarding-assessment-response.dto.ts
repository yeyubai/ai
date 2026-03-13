export class OnboardingAssessmentResponseDto {
  assessmentId!: string;
  recommendedDailyActions!: string[];
  membershipState!: {
    plan: 'free' | 'coach_plus';
    trialEligible: boolean;
  };
}
