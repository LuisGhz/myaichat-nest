import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, Message, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { OpenAIService } from './openai.service';
import {
  StreamEventType,
  type ChatStreamEvent,
  type StreamDoneEvent,
} from '../dto';

export interface CreateChatData {
  user: User;
  model: string;
  maxTokens: number;
}

export interface SaveMessageData {
  chat: Chat;
  content: string;
  role: MessageRole;
  inputTokens?: number;
  outputTokens?: number;
}

export interface HandleStreamMessageParams {
  chatId?: string;
  message: string;
  model: string;
  maxTokens: number;
  userId: string;
  onEvent: (event: ChatStreamEvent) => void;
}

export interface HandleStreamMessageResult {
  success: boolean;
  chatId: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  title?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly openAIService: OpenAIService,
  ) {}

  async createChat(data: CreateChatData): Promise<Chat> {
    const chat = this.chatRepository.create({
      user: data.user,
      model: data.model,
      maxTokens: data.maxTokens,
    });

    return this.chatRepository.save(chat);
  }

  async findChatById(id: string, userId: string): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
  }

  async findChatByIdOrFail(id: string, userId: string): Promise<Chat> {
    const chat = await this.findChatById(id, userId);

    if (!chat) {
      this.logger.error(`Chat with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Chat with id ${id} not found`);
    }

    return chat;
  }

  async saveMessage(data: SaveMessageData): Promise<Message> {
    const message = this.messageRepository.create({
      chat: data.chat,
      content: data.content,
      role: data.role,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
    });

    return this.messageRepository.save(message);
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    await this.chatRepository.update(chatId, { title });
  }

  async getChatMessages(
    chatId: string,
    userId: string,
  ): Promise<{ chat: Chat; messages: Message[] }> {
    const chat = await this.findChatByIdOrFail(chatId, userId);

    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
      select: ['id', 'content', 'role', 'createdAt'],
    });

    return { chat, messages };
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
      select: ['id', 'title', 'model', 'createdAt', 'updatedAt'],
    });
  }

  async hasMessages(chatId: string): Promise<boolean> {
    const count = await this.messageRepository.count({
      where: { chat: { id: chatId } },
    });
    return count > 0;
  }

  /**
   * Handle streaming message to OpenAI, save messages, and generate title for new chats
   */
  async handleStreamMessage(params: HandleStreamMessageParams) {
    const { chatId, message, model, maxTokens, userId, onEvent } = params;

    // Get or create chat
    const chat = chatId
      ? await this.findChatByIdOrFail(chatId, userId)
      : await this.createChat({
          user: { id: userId } as User,
          model,
          maxTokens,
        });

    const isNewChat = !chatId;
    let fullContent = '';

    // Stream response from OpenAI
    const result = await this.openAIService.streamResponse(
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

    // Save user message with input tokens
    await this.saveMessage({
      chat,
      content: message,
      role: MessageRole.USER,
      inputTokens: result.inputTokens,
    });

    // Save assistant message with output tokens
    await this.saveMessage({
      chat,
      content: fullContent,
      role: MessageRole.ASSISTANT,
      outputTokens: result.outputTokens,
    });

    // Generate title for new chats
    let title: string | undefined;
    if (isNewChat) {
      title = await this.openAIService.generateTitle(message, fullContent);
      await this.updateChatTitle(chat.id, title);
    }

    // Send done event
    const doneEventData: StreamDoneEvent['data'] = {
      chatId: chat.id,
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
