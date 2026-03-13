import { Injectable } from '@nestjs/common';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { getTodayInTimezone } from 'src/shared/utils/date.utils';
import { OnboardingAssessmentRequestDto } from '../dto/onboarding-assessment-request.dto';
import { OnboardingAssessmentResponseDto } from '../dto/onboarding-assessment-response.dto';
import { OnboardingCompleteResponseDto } from '../dto/onboarding-complete-response.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly journeyState: JourneyStateService) {}

  async createAssessment(
    userId: bigint,
    payload: OnboardingAssessmentRequestDto,
  ): Promise<OnboardingAssessmentResponseDto> {
    const assessment = this.journeyState.saveAssessment(userId, payload);
    const membershipState = this.journeyState.getMembershipStatus(userId);

    return {
      assessmentId: assessment.assessmentId,
      recommendedDailyActions: assessment.recommendedDailyActions,
      membershipState: {
        plan: membershipState.plan,
        trialEligible: false,
      },
    };
  }

  async complete(userId: bigint): Promise<OnboardingCompleteResponseDto> {
    this.journeyState.completeOnboarding(userId);
    return {
      homeRedirect: '/dashboard',
      firstMissionDate: getTodayInTimezone(),
    };
  }
}
