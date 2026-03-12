import { Injectable } from '@nestjs/common';
import { LlmClient } from 'src/shared/llm/llm.client';
import { AiProviderDto } from '../dto/ai-provider.dto';

@Injectable()
export class AiService {
  constructor(private readonly llmClient: LlmClient) {}

  getProvider(): AiProviderDto {
    return { provider: this.llmClient.provider };
  }
}
