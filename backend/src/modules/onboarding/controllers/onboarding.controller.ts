import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { OnboardingAssessmentRequestDto } from '../dto/onboarding-assessment-request.dto';
import { OnboardingAssessmentResponseDto } from '../dto/onboarding-assessment-response.dto';
import { OnboardingCompleteResponseDto } from '../dto/onboarding-complete-response.dto';
import { OnboardingService } from '../services/onboarding.service';

@Controller('onboarding')
@UseGuards(SessionAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('assessment')
  @HttpCode(HttpStatus.OK)
  createAssessment(
    @CurrentUserId() userId: bigint,
    @Body() payload: OnboardingAssessmentRequestDto,
  ): Promise<OnboardingAssessmentResponseDto> {
    return this.onboardingService.createAssessment(userId, payload);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUserId() userId: bigint): Promise<OnboardingCompleteResponseDto> {
    return this.onboardingService.complete(userId);
  }
}
