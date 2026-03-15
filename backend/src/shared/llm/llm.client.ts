import { Injectable } from '@nestjs/common';
import { envConfig } from '../config/env.config';

type TextMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type VisionMessage = {
  systemPrompt: string;
  userPrompt: string;
  imageDataUrl: string;
};

type ChatCompletionChoice = {
  message?: {
    content?: string | Array<{ text?: string }>;
  };
};

type ChatCompletionResponse = {
  choices?: ChatCompletionChoice[];
};

@Injectable()
export class LlmClient {
  get provider(): string {
    return envConfig.dashscopeApiKey ? 'dashscope' : 'disabled';
  }

  get isEnabled(): boolean {
    return this.provider !== 'disabled';
  }

  async createVisionJsonCompletion(payload: VisionMessage): Promise<string> {
    return this.requestChatCompletion(envConfig.dashscopeVisionModel, [
      {
        role: 'system',
        content: payload.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: payload.userPrompt },
          { type: 'image_url', image_url: { url: payload.imageDataUrl } },
        ],
      },
    ]);
  }

  async createTextCompletion(messages: TextMessage[]): Promise<string> {
    return this.requestChatCompletion(
      envConfig.dashscopeChatModel,
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    );
  }

  private async requestChatCompletion(model: string, messages: unknown[]): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('dashscope_disabled');
    }

    const response = await fetch(`${envConfig.dashscopeBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${envConfig.dashscopeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`dashscope_http_${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => item.text ?? '')
        .join('')
        .trim();
    }

    throw new Error('dashscope_empty_response');
  }
}
