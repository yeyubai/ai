import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { ProgressService } from '../services/progress.service';

@Controller('progress')
@UseGuards(SessionAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('weekly')
  getWeekly(@CurrentUserId() userId: bigint) {
    return this.progressService.getWeekly(userId);
  }

  @Get('monthly')
  getMonthly(@CurrentUserId() userId: bigint) {
    return this.progressService.getMonthly(userId);
  }

  @Get('weekly-report')
  getWeeklyReport(@CurrentUserId() userId: bigint) {
    return this.progressService.getWeeklyReport(userId);
  }
}
