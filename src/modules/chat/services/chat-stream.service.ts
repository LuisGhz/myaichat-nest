import { Injectable, Logger } from '@nestjs/common';
import { Chat, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { ChatService } from './chat.service';
import { AIProviderRegistry } from './ai-provider-registry.service';
import {
  StreamEventType,
  type ChatStreamEvent,
  type StreamDoneEvent,
} from '../dto';
import type { AIProvider } from '../interfaces';

export interface HandleStreamMessageParams {
  chatId?: string;
  message: string;
  model: string;
  maxTokens: number;
  userId: string;
  provider: string;
  onEvent: (event: ChatStreamEvent) => void;
}

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly aiProviderRegistry: AIProviderRegistry,
  ) {}

  /**
   * Handle streaming message to AI provider, save messages, and generate title for new chats
   */
  async handleStreamMessage(params: HandleStreamMessageParams): Promise<void> {
    const { chatId, message, model, maxTokens, userId, provider, onEvent } =
      params;

    const aiProvider = this.aiProviderRegistry.getProvider(provider);

    // Get or create chat
    const chat = await this.getOrCreateChat(chatId, userId, model, maxTokens);
    const isNewChat = !chatId;
    let fullContent = '';

    // Stream response from AI provider
    const result = await aiProvider.streamResponse(
      {
        message,
        model: chat.model,
        maxTokens: chat.maxTokens,
      },
      (delta) => {
        fullContent += delta;
        onEvent({
          type: StreamEventType.DELTA,
          data: delta,
        });
      },
    );

    // Save messages
    await this.saveMessages(chat, message, fullContent, result);

    // Generate title for new chats
    const title = isNewChat
      ? await this.generateAndSaveTitle(aiProvider, chat.id, message, fullContent)
      : undefined;

    // Send done event
    this.sendDoneEvent(onEvent, chat.id, result, title);
  }

  private async getOrCreateChat(
    chatId: string | undefined,
    userId: string,
    model: string,
    maxTokens: number,
  ): Promise<Chat> {
    if (chatId) return this.chatService.findChatByIdOrFail(chatId, userId);

    return this.chatService.createChat({
      user: { id: userId } as User,
      model,
      maxTokens,
    });
  }

  private async saveMessages(
    chat: Chat,
    userMessage: string,
    assistantContent: string,
    result: { inputTokens: number; outputTokens: number },
  ): Promise<void> {
    // Save user message with input tokens
    await this.chatService.saveMessage({
      chat,
      content: userMessage,
      role: MessageRole.USER,
      inputTokens: result.inputTokens,
    });

    // Save assistant message with output tokens
    await this.chatService.saveMessage({
      chat,
      content: assistantContent,
      role: MessageRole.ASSISTANT,
      outputTokens: result.outputTokens,
    });
  }

  private async generateAndSaveTitle(
    aiProvider: AIProvider,
    chatId: string,
    userMessage: string,
    assistantContent: string,
  ): Promise<string> {
    const title = await aiProvider.generateTitle(userMessage, assistantContent);
    await this.chatService.updateChatTitle(chatId, title);
    return title;
  }

  private sendDoneEvent(
    onEvent: (event: ChatStreamEvent) => void,
    chatId: string,
    result: { inputTokens: number; outputTokens: number },
    title?: string,
  ): void {
    const doneEventData: StreamDoneEvent['data'] = {
      chatId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      title,
    };

    onEvent({
      type: StreamEventType.DONE,
      data: doneEventData,
    });
  }
}
