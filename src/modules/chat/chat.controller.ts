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
import { ChatService, ChatStreamService } from './services';
import {
  ChatMessagesResDto,
  SendMessageReqDto,
  StreamEventType,
  type ChatStreamEvent,
} from './dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
  ) {}

  @Get()
  async getUserChats(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub);
  }

  @Post('openai')
  async sendMessageOpenAI(
    @Body() dto: SendMessageReqDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    await this.#handleStreamRequest(res, dto, user.sub, 'openai');
  }

  @Get(':id/messages')
  async getChatMessages(
    @Param('id', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatMessagesResDto[]> {
    const messages = await this.chatService.getChatMessages(chatId, user.sub);

    return messages;
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

  async #handleStreamRequest(
    res: Response,
    dto: SendMessageReqDto,
    userId: string,
    provider: string,
  ): Promise<void> {
    this.#setSSEHeaders(res);

    try {
      await this.chatStreamService.handleStreamMessage({
        chatId: dto.chatId,
        message: dto.message,
        model: dto.model,
        maxTokens: dto.maxTokens,
        userId,
        provider,
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
}
