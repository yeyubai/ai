import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LlmClient } from 'src/shared/llm/llm.client';
import { AiController } from './controllers/ai.controller';
import { AiRepository } from './repositories/ai.repository';
import { AiService } from './services/ai.service';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService, AiRepository, LlmClient],
})
export class AiModule {}
