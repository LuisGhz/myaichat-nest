import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt, PromptMessage } from '../entities';
import { Chat } from '@chat/entities';
import { User } from '@usr/entities';
import {
  CreatePromptReqDto,
  CreatePromptResDto,
  UpdatePromptReqDto,
  UpdatePromptResDto,
  PromptResDto,
  PromptListItemResDto,
} from '../dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @InjectRepository(PromptMessage)
    private readonly promptMessageRepository: Repository<PromptMessage>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async create(
    dto: CreatePromptReqDto,
    userId: string,
  ): Promise<CreatePromptResDto> {
    let chat: Chat | undefined;

    if (dto.chatId) {
      const foundChat = await this.chatRepository.findOne({
        where: { id: dto.chatId, user: { id: userId } },
      });

      if (!foundChat) {
        throw new NotFoundException(`Chat with id ${dto.chatId} not found`);
      }

      chat = foundChat;
    }

    const prompt = this.promptRepository.create({
      name: dto.name,
      content: dto.content,
      user: { id: userId } as User,
      chat,
      messages: dto.messages?.map((msg) =>
        this.promptMessageRepository.create({
          role: msg.role,
          content: msg.content,
        }),
      ),
    });

    const savedPrompt = await this.promptRepository.save(prompt);

    return this.mapToResponseDto(savedPrompt);
  }

  async findAll(userId: string): Promise<PromptListItemResDto[]> {
    const prompts = await this.promptRepository.find({
      where: { user: { id: userId } },
      relations: ['chat', 'messages'],
      order: { updatedAt: 'DESC' },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      chatId: prompt.chat?.id,
      messageCount: prompt.messages?.length ?? 0,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    }));
  }

  async findOne(id: string, userId: string): Promise<PromptResDto> {
    const prompt = await this.findByIdOrFail(id, userId);

    return this.mapToResponseDto(prompt);
  }

  async update(
    id: string,
    dto: UpdatePromptReqDto,
    userId: string,
  ): Promise<UpdatePromptResDto> {
    const prompt = await this.findByIdOrFail(id, userId);

    if (dto.name !== undefined) {
      prompt.name = dto.name;
    }

    if (dto.content !== undefined) {
      prompt.content = dto.content;
    }

    if (dto.chatId !== undefined) {
      if (dto.chatId) {
        const chat = await this.chatRepository.findOne({
          where: { id: dto.chatId, user: { id: userId } },
        });

        if (!chat) {
          throw new NotFoundException(`Chat with id ${dto.chatId} not found`);
        }

        prompt.chat = chat;
      } else {
        prompt.chat = undefined;
      }
    }

    if (dto.messages !== undefined) {
      // Remove existing messages that are not in the update
      const existingMessageIds = prompt.messages.map((m) => m.id);
      const updatedMessageIds = dto.messages
        .filter((m) => m.id)
        .map((m) => m.id);
      const messagesToDelete = existingMessageIds.filter(
        (id) => !updatedMessageIds.includes(id),
      );

      if (messagesToDelete.length > 0) {
        await this.promptMessageRepository.delete(messagesToDelete);
      }

      // Update existing messages and create new ones
      const updatedMessages: PromptMessage[] = [];

      for (const msgDto of dto.messages) {
        if (msgDto.id) {
          // Update existing message
          const existingMessage = prompt.messages.find(
            (m) => m.id === msgDto.id,
          );

          if (existingMessage) {
            existingMessage.role = msgDto.role;
            existingMessage.content = msgDto.content;
            updatedMessages.push(existingMessage);
          }
        } else {
          // Create new message
          const newMessage = this.promptMessageRepository.create({
            role: msgDto.role,
            content: msgDto.content,
            prompt,
          });
          updatedMessages.push(newMessage);
        }
      }

      prompt.messages = updatedMessages;
    }

    const savedPrompt = await this.promptRepository.save(prompt);

    return this.mapToResponseDto(savedPrompt);
  }

  async remove(id: string, userId: string): Promise<void> {
    const prompt = await this.findByIdOrFail(id, userId);

    if (prompt.chat) {
      throw new BadRequestException(
        'Cannot delete a prompt that belongs to a chat. Remove the chat association first.',
      );
    }

    await this.promptRepository.remove(prompt);
  }

  private async findByIdOrFail(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['chat', 'messages', 'user'],
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id ${id} not found`);
    }

    return prompt;
  }

  private mapToResponseDto(prompt: Prompt): PromptResDto {
    return {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      chatId: prompt.chat?.id,
      messages:
        prompt.messages?.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        })) ?? [],
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    };
  }
}
