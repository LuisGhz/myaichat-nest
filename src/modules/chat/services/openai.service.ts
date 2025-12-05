import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from '@cfg/schema/env.service';
import type {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
} from '../interfaces';
import { Message, MessageRole } from '../entities';
import { CHAT_TITLE_MODEL, CHAT_TITLE_PROMPT } from '../consts';

@Injectable()
export class OpenAIService implements AIProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;

  constructor(private readonly envService: EnvService) {
    this.client = new OpenAI({
      apiKey: this.envService.openaiApiKey,
    });
  }

  async streamResponse(
    params: StreamResponseParams,
    onDelta: (delta: string) => void,
  ): Promise<StreamResponseResult> {
    const { previousMessages, newMessage, model, maxTokens } = params;
    const transformedMessages =
      this.#transformMessagesToOpenAIFormat(previousMessages);
    transformedMessages.push({ role: 'user', content: newMessage });
    this.logger.debug('Transformed Messages:', transformedMessages);
    try {
      const stream = this.client.responses.stream({
        model,
        input: transformedMessages,
        max_output_tokens: maxTokens,
      });

      stream.on('response.output_text.delta', (event) => {
        onDelta(event.delta);
      });

      const response = await stream.finalResponse();

      return {
        content: response.output_text,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      };
    } catch (error) {
      this.logger.error('Error streaming response from OpenAI', error);
      throw error;
    }
  }

  async generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: CHAT_TITLE_MODEL,
        input: CHAT_TITLE_PROMPT(userMessage, assistantResponse),
        max_output_tokens: 30,
      });

      return response.output_text.trim();
    } catch (error) {
      this.logger.error('Error generating chat title', error);
      return 'New Chat';
    }
  }

  #transformMessagesToOpenAIFormat(messages: Message[]): any[] {
    return messages.map((msg) => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content,
    }));
  }
}
