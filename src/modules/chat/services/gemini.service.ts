import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
} from '../interfaces';
import { EnvService } from '@cfg/schema/env.service';
import {
  messagesTransformerForGemini,
  newMessageTransformerForGemini,
  setSystemMessageGemini,
} from '../helpers';

@Injectable()
export class GeminiService implements AIProvider {
  private readonly logger = new Logger(GeminiService.name);
  providerName: string = 'google';
  private readonly client: GoogleGenAI;

  constructor(private readonly envService: EnvService) {
    this.client = new GoogleGenAI({
      apiKey: this.envService.geminiApiKey,
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
      systemPrompt,
    } = params;
    const transformedMessages = messagesTransformerForGemini(previousMessages);

    transformedMessages.push(newMessageTransformerForGemini(newMessage));
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    this.logger.debug('Transformed Messages:', transformedMessages);

    const res = await this.client.models.generateContentStream({
      model: model,
      contents: [setSystemMessageGemini(systemPrompt), ...transformedMessages],

      config: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    });

    for await (const chunk of res) {
      const text = chunk.text || '';
      fullText += text;
      onDelta(text);
      if (chunk.usageMetadata) {
        inputTokens = chunk.usageMetadata.promptTokenCount || 0;
        outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    // if (params.isImageGeneration) {
    //   const model = await this.client.models.generateImages({
    //     model: 'imagen-3.0-generate-002',
    //     prompt: 'Robot holding a red skateboard',
    //     config: {
    //       numberOfImages: 1,
    //       includeRaiReason: true,
    //     },
    //   });
    // }

    this.logger.debug('Full response:', {
      content: fullText,
      inputTokens,
      outputTokens,
    });

    return {
      content: fullText,
      inputTokens,
      outputTokens,
    };
  }

  async generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> {
    const res = await this.client.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a very short title (max 6 words) for a conversation that starts with this exchange. Return only the title, no quotes or extra text, Do not utilize special characters like ", neither markdown characters.

              User: ${userMessage}
              Assistant: ${assistantResponse.slice(0, 500)}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 20,
      },
    });
    return res.text!.trim();
  }
}
