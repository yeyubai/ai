import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { CompleteHomeActionRequestDto } from '../dto/complete-home-action-request.dto';
import { CompleteHomeActionResponseDto } from '../dto/complete-home-action-response.dto';
import { HomeTodayResponseDto } from '../dto/home-today-response.dto';
import { HomeService } from '../services/home.service';

@Controller('home')
@UseGuards(SessionAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('today')
  getToday(@CurrentUserId() userId: bigint) {
    return this.homeService.getToday(userId);
  }

  @Post('actions/:actionId/complete')
  @HttpCode(HttpStatus.OK)
  completeAction(
    @CurrentUserId() userId: bigint,
    @Param('actionId') actionId: string,
    @Body() payload: CompleteHomeActionRequestDto,
  ): Promise<CompleteHomeActionResponseDto> {
    return this.homeService.completeAction(userId, actionId, payload.completedAt);
  }
}
