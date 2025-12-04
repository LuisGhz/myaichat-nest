import { Injectable } from '@nestjs/common';
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
  constructor(
    private readonly chatService: ChatService,
    private readonly aiProviderRegistry: AIProviderRegistry,
  ) {}

  async handleStreamMessage(params: HandleStreamMessageParams): Promise<void> {
    const { chatId, message, model, maxTokens, userId, provider, onEvent } =
      params;

    const aiProvider = this.aiProviderRegistry.getProvider(provider);

    const chat = await this.#getOrCreateChat(chatId, userId, model, maxTokens);
    const isNewChat = !chatId;
    let fullContent = '';
    const messages = chat.messages || [];
    const result = await aiProvider.streamResponse(
      {
        previousMessages: messages,
        newMessage: message,
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

    await this.#saveMessages(chat, message, fullContent, result);

    const title = isNewChat
      ? await this.#generateAndSaveTitle(
          aiProvider,
          chat.id,
          message,
          fullContent,
        )
      : undefined;

    this.#sendDoneEvent(onEvent, chat.id, result, title);
  }

  async #getOrCreateChat(
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

  async #saveMessages(
    chat: Chat,
    userMessage: string,
    assistantContent: string,
    result: { inputTokens: number; outputTokens: number },
  ): Promise<void> {
    await this.chatService.saveMessage({
      chat,
      content: userMessage,
      role: MessageRole.USER,
      inputTokens: result.inputTokens,
    });

    await this.chatService.saveMessage({
      chat,
      content: assistantContent,
      role: MessageRole.ASSISTANT,
      outputTokens: result.outputTokens,
    });
  }

  async #generateAndSaveTitle(
    aiProvider: AIProvider,
    chatId: string,
    userMessage: string,
    assistantContent: string,
  ): Promise<string> {
    const title = await aiProvider.generateTitle(userMessage, assistantContent);
    await this.chatService.updateChatTitle(chatId, title);
    return title;
  }

  #sendDoneEvent(
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
