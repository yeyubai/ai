import { Injectable } from '@nestjs/common';
import { envConfig } from '../config/env.config';

@Injectable()
export class LlmClient {
  get provider(): string {
    return envConfig.dashscopeApiKey ? 'dashscope' : 'disabled';
  }
}
