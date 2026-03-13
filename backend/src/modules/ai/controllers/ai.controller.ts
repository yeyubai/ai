import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { AiProviderDto } from '../dto/ai-provider.dto';
import { AiPlanResponseDto } from '../dto/ai-plan-response.dto';
import { AiReviewResponseDto } from '../dto/ai-review-response.dto';
import { CreateAiPlanRequestDto } from '../dto/create-ai-plan-request.dto';
import { CreateAiReviewRequestDto } from '../dto/create-ai-review-request.dto';
import { AiService } from '../services/ai.service';

@Controller('ai')
@UseGuards(SessionAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  createPlan(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateAiPlanRequestDto,
  ): Promise<AiPlanResponseDto> {
    return this.aiService.createPlan(userId, payload);
  }

  @Post('review')
  @HttpCode(HttpStatus.OK)
  createReview(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateAiReviewRequestDto,
  ): Promise<AiReviewResponseDto> {
    return this.aiService.createReview(userId, payload);
  }

  @Get('provider')
  getProvider(): AiProviderDto {
    return this.aiService.getProvider();
  }
}
