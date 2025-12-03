import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { ChatService } from './services';
import {
  ChatMessagesResDto,
  SendMessageReqDto,
  StreamEventType,
  type ChatStreamEvent,
} from './dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('openai')
  async sendMessage(
    @Body() dto: SendMessageReqDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    this.#setSSEHeaders(res);

    try {
      await this.chatService.handleStreamMessage({
        chatId: dto.chatId,
        message: dto.message,
        model: dto.model,
        maxTokens: dto.maxTokens,
        userId: user.sub,
        onEvent: (event: ChatStreamEvent) => this.#sendSSEEvent(res, event),
      });

      res.end();
    } catch (error) {
      this.logger.error('Error in chat stream', error);
      this.#sendSSEEvent(res, {
        type: StreamEventType.ERROR,
        data: {
          message: error instanceof Error ? error.message : 'An error occurred',
          code: 'STREAM_ERROR',
        },
      });
      res.end();
    }
  }

  @Get(':id/messages')
  async getChatMessages(
    @Param('id', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatMessagesResDto> {
    const { chat, messages } = await this.chatService.getChatMessages(
      chatId,
      user.sub,
    );

    return {
      chatId: chat.id,
      title: chat.title,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        createdAt: m.createdAt,
      })),
    };
  }

  @Get()
  async getUserChats(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub);
  }

  #setSSEHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }

  #sendSSEEvent(res: Response, event: ChatStreamEvent): void {
    res.write(`${JSON.stringify(event)}\n\n`);
  }
}
