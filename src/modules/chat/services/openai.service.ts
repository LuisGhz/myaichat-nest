import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { ResponseInput } from 'openai/resources/responses/responses';
import { EnvService } from '@cfg/schema/env.service';
import type {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
  CreateImageGenerationTool,
  CreateWebSearchTool,
} from '../interfaces';
import { Message } from '../entities';
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
    const {
      previousMessages,
      newMessage,
      model,
      maxTokens,
      temperature,
      fileKey,
      isImageGeneration,
      isWebSearch,
    } = params;
    const transformedMessages =
      this.#transformMessagesToOpenAIFormat(previousMessages);
    transformedMessages.push(
      ...this.#transformNewMessageToOpenAIFormat(newMessage, fileKey),
    );
    this.logger.debug('Transformed Messages:', transformedMessages);
    const tools = this.#createToolParamsIfEnabled(
      isWebSearch,
      isImageGeneration,
    );

    try {
      const stream = this.client.responses.stream({
        model,
        input: transformedMessages,
        max_output_tokens: maxTokens,
        tools,
        temperature,
      });

      stream.on('response.output_text.delta', (event) => {
        onDelta(event.delta);
      });

      const response = await stream.finalResponse();

      let imageBase64: string | null = null;
      if (isImageGeneration) {
        const imageData = response.output
          .filter((out) => out.type === 'image_generation_call')
          .map((out) => out.result);
        imageBase64 = imageData[0];
      }

      return {
        content: response.output_text,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        imageKey: imageBase64 ?? undefined,
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

  #transformMessagesToOpenAIFormat(messages: Message[]): ResponseInput {
    return messages.map((msg) => ({
      role: msg.role,
      content: [{ type: 'input_text' as const, text: msg.content }],
    }));
  }

  #transformNewMessageToOpenAIFormat(
    message: string,
    fileKey?: string,
  ): ResponseInput {
    if (fileKey) {
      if (this.#isImage(fileKey)) {
        const imageUrl = `${this.envService.cdnDomain}${fileKey}`;
        this.logger.debug('Image URL:', imageUrl);
        return [
          {
            role: 'user',
            content: [
              { type: 'input_text' as const, text: message },
              {
                type: 'input_image' as const,
                image_url: imageUrl,
                detail: 'auto',
              },
            ],
          },
        ];
      }
    }
    return [
      {
        role: 'user',
        content: [{ type: 'input_text' as const, text: message }],
      },
    ];
  }

  #isImage(fileKey: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    return imageExtensions.some((ext) => fileKey.endsWith(ext));
  }

  #createToolParamsIfEnabled(isWebSearch: boolean, isImageGeneration: boolean) {
    const tools: Array<CreateImageGenerationTool | CreateWebSearchTool> = [];

    if (isImageGeneration) {
      const imageGenTool: CreateImageGenerationTool = {
        type: 'image_generation',
        size: '1024x1024',
        quality: 'medium',
        background: 'auto',
      };
      tools.push(imageGenTool);
    }

    if (isWebSearch) {
      const webSearchTool: CreateWebSearchTool = {
        type: 'web_search',
        search_context_size: 'medium',
      };
      tools.push(webSearchTool);
    }

    return tools;
  }
}
