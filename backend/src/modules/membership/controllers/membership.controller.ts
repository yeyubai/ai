import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { ReminderSettingsRequestDto } from '../dto/reminder-settings-request.dto';
import { MembershipService } from '../services/membership.service';

@Controller()
@UseGuards(SessionAuthGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('membership/status')
  getStatus(@CurrentUserId() userId: bigint) {
    return this.membershipService.getStatus(userId);
  }

  @Get('reminders/settings')
  getReminderSettings(@CurrentUserId() userId: bigint) {
    return this.membershipService.getReminderSettings(userId);
  }

  @Put('reminders/settings')
  @HttpCode(HttpStatus.OK)
  updateReminderSettings(
    @CurrentUserId() userId: bigint,
    @Body() payload: ReminderSettingsRequestDto,
  ) {
    return this.membershipService.updateReminderSettings(userId, payload);
  }

  @Get('reminders/receipts')
  getReminderReceipts(@CurrentUserId() userId: bigint) {
    return this.membershipService.getReminderReceipts(userId);
  }
}
