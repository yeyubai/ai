import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { CreateWeightEntryRequestDto } from '../dto/create-weight-entry-request.dto';
import { QueryWeightEntriesRequestDto } from '../dto/query-weight-entries-request.dto';
import { QueryWeightRangeRequestDto } from '../dto/query-weight-range-request.dto';
import { UpdateWeightEntryRequestDto } from '../dto/update-weight-entry-request.dto';
import { WeightsService } from '../services/weights.service';

@Controller('weights')
@UseGuards(SessionAuthGuard)
export class WeightsController {
  constructor(private readonly weightsService: WeightsService) {}

  @Get('today-summary')
  getTodaySummary(@CurrentUserId() userId: bigint) {
    return this.weightsService.getTodaySummary(userId);
  }

  @Get('stats')
  getStats(
    @CurrentUserId() userId: bigint,
    @Query() query: QueryWeightRangeRequestDto,
  ) {
    return this.weightsService.getStats(userId, query);
  }

  @Get('trend')
  getTrend(
    @CurrentUserId() userId: bigint,
    @Query() query: QueryWeightRangeRequestDto,
  ) {
    return this.weightsService.getTrend(userId, query);
  }

  @Get('entries')
  listEntries(
    @CurrentUserId() userId: bigint,
    @Query() query: QueryWeightEntriesRequestDto,
  ) {
    return this.weightsService.listEntries(userId, query);
  }

  @Get('entries/:entryId')
  getEntry(
    @CurrentUserId() userId: bigint,
    @Param('entryId') entryId: string,
  ) {
    return this.weightsService.getEntry(userId, entryId);
  }

  @Post('entries')
  @HttpCode(HttpStatus.OK)
  createEntry(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateWeightEntryRequestDto,
  ) {
    return this.weightsService.createEntry(userId, payload);
  }

  @Put('entries/:entryId')
  @HttpCode(HttpStatus.OK)
  updateEntry(
    @CurrentUserId() userId: bigint,
    @Param('entryId') entryId: string,
    @Body() payload: UpdateWeightEntryRequestDto,
  ) {
    return this.weightsService.updateEntry(userId, entryId, payload);
  }

  @Delete('entries/:entryId')
  @HttpCode(HttpStatus.OK)
  deleteEntry(
    @CurrentUserId() userId: bigint,
    @Param('entryId') entryId: string,
  ) {
    return this.weightsService.deleteEntry(userId, entryId);
  }
}
