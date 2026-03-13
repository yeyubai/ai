import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import {
  CheckinHistoryResponseDto,
  TodayCheckinsResponseDto,
} from '../dto/checkin-feed-response.dto';
import { CheckinCreatedResponseDto } from '../dto/checkin-created-response.dto';
import { CreateActivityCheckinRequestDto } from '../dto/create-activity-checkin-request.dto';
import { CreateMealCheckinRequestDto } from '../dto/create-meal-checkin-request.dto';
import { CreateSleepCheckinRequestDto } from '../dto/create-sleep-checkin-request.dto';
import { CreateWeightCheckinRequestDto } from '../dto/create-weight-checkin-request.dto';
import { QueryCheckinHistoryRequestDto } from '../dto/query-checkin-history-request.dto';
import { CheckinsService } from '../services/checkins.service';

@Controller('checkins')
@UseGuards(SessionAuthGuard)
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post('weight')
  @HttpCode(HttpStatus.OK)
  createWeight(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateWeightCheckinRequestDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    return this.checkinsService.createWeightCheckin(userId, payload, idempotencyKey);
  }

  @Post('meal')
  @HttpCode(HttpStatus.OK)
  createMeal(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateMealCheckinRequestDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    return this.checkinsService.createMealCheckin(userId, payload, idempotencyKey);
  }

  @Post('activity')
  @HttpCode(HttpStatus.OK)
  createActivity(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateActivityCheckinRequestDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    return this.checkinsService.createActivityCheckin(userId, payload, idempotencyKey);
  }

  @Post('sleep')
  @HttpCode(HttpStatus.OK)
  createSleep(
    @CurrentUserId() userId: bigint,
    @Body() payload: CreateSleepCheckinRequestDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ): Promise<CheckinCreatedResponseDto> {
    return this.checkinsService.createSleepCheckin(userId, payload, idempotencyKey);
  }

  @Get('today')
  getToday(@CurrentUserId() userId: bigint): Promise<TodayCheckinsResponseDto> {
    return this.checkinsService.getTodayCheckins(userId);
  }

  @Get('history')
  getHistory(
    @CurrentUserId() userId: bigint,
    @Query() query: QueryCheckinHistoryRequestDto,
  ): Promise<CheckinHistoryResponseDto> {
    return this.checkinsService.getHistory(userId, query);
  }
}
