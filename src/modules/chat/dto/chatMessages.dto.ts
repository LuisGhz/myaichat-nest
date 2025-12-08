class MessageDto {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  inputTokens?: number;
  outputTokens?: number;
  file?: string;
}

export class ChatMessagesResDto {
  messages: MessageDto[];
  maxTokens: number;
  temperature: number;
}
