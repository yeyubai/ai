import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { LlmClient } from 'src/shared/llm/llm.client';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';

@Module({
  imports: [AuthModule],
  controllers: [CoachController],
  providers: [CoachService, LlmClient],
  exports: [CoachService],
})
export class CoachModule {}
