import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { DeleteRequestDto } from '../dto/delete-request.dto';
import { ExportRequestDto } from '../dto/export-request.dto';
import { UpdateSettingsRequestDto } from '../dto/update-settings-request.dto';
import { SettingsService } from '../services/settings.service';

@Controller()
@UseGuards(SessionAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  getSettings(@CurrentUserId() userId: bigint) {
    return this.settingsService.getSettings(userId);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  updateSettings(
    @CurrentUserId() userId: bigint,
    @Body() payload: UpdateSettingsRequestDto,
  ) {
    return this.settingsService.updateSettings(userId, payload);
  }

  @Post('account/export')
  @HttpCode(HttpStatus.OK)
  createExport(
    @CurrentUserId() userId: bigint,
    @Body() payload: ExportRequestDto,
  ) {
    return this.settingsService.createExport(userId, payload.format);
  }

  @Get('account/export/:taskId')
  getExportTask(
    @CurrentUserId() userId: bigint,
    @Param('taskId') taskId: string,
  ) {
    return this.settingsService.getExportTask(userId, taskId);
  }

  @Post('account/delete-request')
  @HttpCode(HttpStatus.OK)
  createDeleteRequest(
    @CurrentUserId() userId: bigint,
    @Body() payload: DeleteRequestDto,
  ) {
    return this.settingsService.createDeleteRequest(userId, payload.reason);
  }

  @Get('account/delete-request')
  getDeleteRequest(@CurrentUserId() userId: bigint) {
    return this.settingsService.getDeleteRequest(userId);
  }

  @Delete('account/delete-request')
  @HttpCode(HttpStatus.OK)
  cancelDeleteRequest(@CurrentUserId() userId: bigint) {
    return this.settingsService.cancelDeleteRequest(userId);
  }
}
