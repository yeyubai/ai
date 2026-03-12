import { Module } from '@nestjs/common';
import { LlmClient } from 'src/shared/llm/llm.client';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, LlmClient],
})
export class AiModule {}
