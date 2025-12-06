import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { S3Service } from '@s3/services';
import { IsValidFileTypeConstraint } from '@s3/validators';
import { ChatService, ChatStreamService } from './services';
import {
  ChatMessagesResDto,
  RenameChatReqDto,
  SendMessageReqDto,
  StreamEventType,
  UpdateImageGenerationReqDto,
  UpdateWebSearchReqDto,
  type ChatStreamEvent,
} from './dto';
import type { HandleStreamRequestParams } from './interfaces';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async getUserChats(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub);
  }

  @Post('openai')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessageOpenAI(
    @Body() dto: SendMessageReqDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    let fileKey: string | undefined;

    if (file) {
      this.#validateFile(file);
      fileKey = await this.s3Service.uploadFile(file);
    }
    console.log('File Key:', fileKey);
    await this.#handleStreamRequest({
      res,
      dto,
      userId: user.sub,
      provider: 'openai',
      fileKey,
      isImageGeneration: dto.isImageGeneration,
      isWebSearch: dto.isWebSearch,
    });
  }

  @Get(':id/messages')
  async getChatMessages(
    @Param('id', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatMessagesResDto[]> {
    const messages = await this.chatService.getChatMessages(chatId, user.sub);

    return messages;
  }

  @Patch(':id/rename')
  @HttpCode(HttpStatus.NO_CONTENT)
  async renameChat(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: RenameChatReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatTitle(chatId, dto.title);
  }

  @Patch(':id/update-web-search')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateWebSearch(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateWebSearchReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatWebSearch(chatId, dto.isWebSearch);
  }

  @Patch(':id/update-image-generation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImageGeneration(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateImageGenerationReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatImageGeneration(chatId, dto.isImageGeneration);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChat(
    @Param('id', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.deleteChat(chatId, user.sub);
  }

  #validateFile(file: Express.Multer.File): void {
    const validator = new IsValidFileTypeConstraint();
    if (!validator.validate(file))
      throw new BadRequestException(validator.defaultMessage());
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

  async #handleStreamRequest({
    res,
    dto,
    userId,
    provider,
    fileKey,
    isImageGeneration,
    isWebSearch,
  }: HandleStreamRequestParams): Promise<void> {
    this.#setSSEHeaders(res);

    try {
      await this.chatStreamService.handleStreamMessage({
        chatId: dto.chatId,
        message: dto.message,
        model: dto.model,
        maxTokens: dto.maxTokens,
        temperature: dto.temperature,
        userId,
        provider,
        fileKey,
        isImageGeneration,
        isWebSearch,
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
