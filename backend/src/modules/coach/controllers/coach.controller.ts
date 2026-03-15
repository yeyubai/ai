import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { CoachService } from '../services/coach.service';
import { CreateCoachMessageRequestDto } from '../dto/create-coach-message-request.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Controller('me/coach')
@UseGuards(SessionAuthGuard)
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('sessions')
  getLatestSession(@CurrentUserId() userId: bigint) {
    return this.coachService.getLatestSession(userId);
  }

  @Get('sessions/:sessionId')
  getSession(
    @CurrentUserId() userId: bigint,
    @Param('sessionId') sessionId: string,
  ) {
    return this.coachService.getSession(userId, sessionId);
  }

  @Post('analysis')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 8 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  analyze(
    @CurrentUserId() userId: bigint,
    @UploadedFile() file: UploadedImageFile | undefined,
  ) {
    return this.coachService.analyzeBodyPhoto(userId, file);
  }

  @Post('sessions/:sessionId/messages')
  @HttpCode(HttpStatus.OK)
  createMessage(
    @CurrentUserId() userId: bigint,
    @Param('sessionId') sessionId: string,
    @Body() payload: CreateCoachMessageRequestDto,
  ) {
    return this.coachService.createMessage(userId, sessionId, payload);
  }
}
