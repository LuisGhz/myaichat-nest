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
import type {
  AIProvider,
  HandleStreamMessageParams,
  GetOrCreateChatParams,
  SaveMessagesParams,
} from '../interfaces';

@Injectable()
export class ChatStreamService {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiProviderRegistry: AIProviderRegistry,
  ) {}

  async handleStreamMessage(params: HandleStreamMessageParams): Promise<void> {
    const {
      chatId,
      message,
      model,
      maxTokens,
      temperature,
      fileKey,
      userId,
      provider,
      onEvent,
    } = params;

    const aiProvider = this.aiProviderRegistry.getProvider(provider);

    const chat = await this.#getOrCreateChat({
      chatId,
      userId,
      model,
      maxTokens,
      temperature,
    });
    const isNewChat = !chatId;
    let fullContent = '';
    const messages = chat.messages || [];
    const result = await aiProvider.streamResponse(
      {
        previousMessages: messages,
        newMessage: message,
        model: chat.model,
        maxTokens: chat.maxTokens,
        temperature: chat.temperature,
        fileKey,
      },
      (delta) => {
        fullContent += delta;
        onEvent({
          type: StreamEventType.DELTA,
          data: delta,
        });
      },
    );

    await this.#saveMessages({
      chat,
      userMessage: message,
      assistantContent: fullContent,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      fileKey,
    });

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

  async #getOrCreateChat(params: GetOrCreateChatParams): Promise<Chat> {
    const { chatId, userId, model, maxTokens, temperature } = params;

    if (chatId) return this.chatService.findChatByIdOrFail(chatId, userId);

    return this.chatService.createChat({
      user: { id: userId } as User,
      model,
      maxTokens,
      temperature,
    });
  }

  async #saveMessages(params: SaveMessagesParams): Promise<void> {
    const {
      chat,
      userMessage,
      assistantContent,
      inputTokens,
      outputTokens,
      fileKey,
    } = params;

    await this.chatService.saveMessage({
      chat,
      content: userMessage,
      role: MessageRole.USER,
      inputTokens,
      fileKey,
    });

    await this.chatService.saveMessage({
      chat,
      content: assistantContent,
      role: MessageRole.ASSISTANT,
      outputTokens,
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
