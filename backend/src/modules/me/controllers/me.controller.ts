import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { MeService } from '../services/me.service';
import { UpdateUserProfileRequestDto } from '../dto/update-user-profile-request.dto';
import { UpdateUserSettingsRequestDto } from '../dto/update-user-settings-request.dto';
import { UpdateWeightGoalRequestDto } from '../dto/update-weight-goal-request.dto';

@Controller('me')
@UseGuards(SessionAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('profile')
  getProfile(@CurrentUserId() userId: bigint) {
    return this.meService.getProfile(userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUserId() userId: bigint,
    @Body() payload: UpdateUserProfileRequestDto,
  ) {
    return this.meService.updateProfile(userId, payload);
  }

  @Get('goal')
  getGoal(@CurrentUserId() userId: bigint) {
    return this.meService.getGoal(userId);
  }

  @Put('goal')
  @HttpCode(HttpStatus.OK)
  updateGoal(
    @CurrentUserId() userId: bigint,
    @Body() payload: UpdateWeightGoalRequestDto,
  ) {
    return this.meService.updateGoal(userId, payload);
  }

  @Get('settings')
  getSettings(@CurrentUserId() userId: bigint) {
    return this.meService.getSettings(userId);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  updateSettings(
    @CurrentUserId() userId: bigint,
    @Body() payload: UpdateUserSettingsRequestDto,
  ) {
    return this.meService.updateSettings(userId, payload);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  createExport() {
    return this.meService.createExport();
  }
}
