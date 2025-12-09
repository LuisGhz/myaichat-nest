import { IsOptional, IsUUID } from 'class-validator';

class MessageDto {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  inputTokens?: number;
  outputTokens?: number;
  file?: string;
}

export class ChatMessagesReqDto {
  @IsOptional()
  @IsUUID()
  beforeMessageId?: string;
}

export class ChatMessagesResDto {
  messages: MessageDto[];
  hasMore: boolean;
  maxTokens: number;
  temperature: number;
}
