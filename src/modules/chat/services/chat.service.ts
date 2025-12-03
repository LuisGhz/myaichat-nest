import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, Message, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { ChatMessagesResDto, UserChatsResDto } from '../dto';

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

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
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
  ): Promise<ChatMessagesResDto[]> {
    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId, user: { id: userId } } },
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'content',
        'role',
        'createdAt',
        'inputTokens',
        'outputTokens',
      ],
    });

    if (!messages) {
      this.logger.error(
        `Messages for chat with id ${chatId} not found for user ${userId}`,
      );
      throw new NotFoundException(
        `Messages for chat with id ${chatId} not found for user ${userId}`,
      );
    }

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      createdAt: m.createdAt,
      inputTokens: m.inputTokens,
      outputTokens: m.outputTokens,
    }));
  }

  async getUserChats(userId: string): Promise<UserChatsResDto[]> {
    return this.chatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      select: ['id', 'title', 'createdAt'],
    });
  }

  async hasMessages(chatId: string): Promise<boolean> {
    const count = await this.messageRepository.count({
      where: { chat: { id: chatId } },
    });
    return count > 0;
  }
}
