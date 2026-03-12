import { Controller, Get } from '@nestjs/common';
import { AiProviderDto } from '../dto/ai-provider.dto';
import { AiService } from '../services/ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('provider')
  getProvider(): AiProviderDto {
    return this.aiService.getProvider();
  }
}
