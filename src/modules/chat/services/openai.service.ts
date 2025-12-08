import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from '@cfg/schema/env.service';
import type {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
} from '../interfaces';
import { CHAT_TITLE_MODEL, CHAT_TITLE_PROMPT } from '../consts';
import {
  calculateImageGenerationTokens,
  createToolParamsIfEnabled,
  transformMessagesToOpenAIFormat,
  transformNewMessageToOpenAIFormat,
} from '../helpers';

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
    const transformedMessages = transformMessagesToOpenAIFormat(
      previousMessages,
      this.envService.cdnDomain,
    );
    transformedMessages.push(
      ...transformNewMessageToOpenAIFormat(
        newMessage,
        this.envService.cdnDomain,
        fileKey,
      ),
    );
    this.logger.debug('Transformed Messages:', transformedMessages);
    const tools = createToolParamsIfEnabled(isWebSearch, isImageGeneration);

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
      let imageTokens = 0;
      if (isImageGeneration) {
        const imageData = response.output
          .filter((out) => out.type === 'image_generation_call')
          .map((out) => out.result);
        imageBase64 = imageData[0];
        // Calculate tokens for image generation if tool was used
        const imageGenTool = tools.find(
          (tool) => tool.type === 'image_generation',
        );
        if (imageGenTool)
          imageTokens = calculateImageGenerationTokens(imageGenTool);
      }

      return {
        content: response.output_text,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0 + imageTokens,
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
}
