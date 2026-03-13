export class MembershipStatusResponseDto {
  plan!: 'free' | 'coach_plus';
  entitlements!: {
    deepReview: boolean;
    weeklyInsight: boolean;
    strongReminder: boolean;
  };
  upgradePrompts!: Array<{
    touchpoint: string;
    headline: string;
  }>;
}
