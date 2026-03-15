import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { CreateDiaryEntryRequestDto } from '../dto/create-diary-entry-request.dto';
import { UpdateDiaryEntryRequestDto } from '../dto/update-diary-entry-request.dto';
import { DiaryService } from '../services/diary.service';

@Controller('diary')
@UseGuards(SessionAuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get('entries')
  listEntries(@CurrentUserId() userId: bigint) {
    return this.diaryService.listEntries(userId);
  }

  @Get('entries/:entryId')
  getEntry(
    @CurrentUserId() userId: bigint,
    @Param('entryId') entryId: string,
  ) {
    return this.diaryService.getEntry(userId, entryId);
  }

  @Post('entries')
  @HttpCode(HttpStatus.OK)
  createEntry(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateDiaryEntryRequestDto,
  ) {
    return this.diaryService.createEntry(userId, payload);
  }

  @Put('entries/:entryId')
  @HttpCode(HttpStatus.OK)
  updateEntry(
    @CurrentUserId() userId: bigint,
    @Param('entryId') entryId: string,
    @Body() payload: UpdateDiaryEntryRequestDto,
  ) {
    return this.diaryService.updateEntry(userId, entryId, payload);
  }
}
