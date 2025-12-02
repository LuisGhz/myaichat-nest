import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from '@cfg/schema/env.service';

export interface StreamResponseParams {
  message: string;
  model: string;
  maxTokens: number;
}

export interface StreamResponseResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;

  constructor(private readonly envService: EnvService) {
    this.client = new OpenAI({
      apiKey: this.envService.openaiApiKey,
    });
  }

  /**
   * Stream a response from OpenAI using the Responses API
   * @param params - The parameters for the request
   * @param onDelta - Callback for each text delta received
   * @returns The complete response with token usage
   */
  async streamResponse(
    params: StreamResponseParams,
    onDelta: (delta: string) => void,
  ): Promise<StreamResponseResult> {
    const { message, model, maxTokens } = params;

    try {
      const stream = this.client.responses.stream({
        model,
        input: message,
        max_output_tokens: maxTokens,
      });

      // Listen for text deltas
      stream.on('response.output_text.delta', (event) => {
        onDelta(event.delta);
      });

      // Wait for the stream to complete and get final response
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

  /**
   * Generate a title for a chat based on the first user message and assistant response
   * Uses gpt-4o-mini for cost efficiency
   */
  async generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-4o-mini',
        input: `Generate a very short title (max 6 words) for a conversation that starts with this exchange. Return only the title, no quotes or extra text.

User: ${userMessage}
Assistant: ${assistantResponse.slice(0, 500)}`,
        max_output_tokens: 30,
      });

      return response.output_text.trim();
    } catch (error) {
      this.logger.error('Error generating chat title', error);
      // Return a default title if generation fails
      return 'New Chat';
    }
  }
}
