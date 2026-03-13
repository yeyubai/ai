import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { ReviewEveningRequestDto } from '../dto/review-evening-request.dto';
import { ReviewSkipRequestDto } from '../dto/review-skip-request.dto';
import { ReviewService } from '../services/review.service';

@Controller('review')
@UseGuards(SessionAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('evening')
  @HttpCode(HttpStatus.OK)
  createEvening(
    @CurrentUserId() userId: bigint,
    @Body() payload: ReviewEveningRequestDto,
  ) {
    return this.reviewService.createEvening(userId, payload.date);
  }

  @Post('skip')
  @HttpCode(HttpStatus.OK)
  skip(
    @CurrentUserId() userId: bigint,
    @Body() payload: ReviewSkipRequestDto,
  ) {
    return this.reviewService.skip(userId, payload.date, payload.reason);
  }
}
