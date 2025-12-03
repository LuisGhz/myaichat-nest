export class ChatMessagesResDto {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  inputTokens?: number;
  outputTokens?: number;
}
