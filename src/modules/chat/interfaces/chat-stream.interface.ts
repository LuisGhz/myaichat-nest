import type { ChatStreamEvent } from '../dto';

export interface HandleStreamMessageParams {
  chatId?: string;
  message: string;
  model: string;
  maxTokens: number;
  temperature: number;
  userId: string;
  provider: string;
  fileKey?: string;
  onEvent: (event: ChatStreamEvent) => void;
}

export interface GetOrCreateChatParams {
  chatId?: string;
  userId: string;
  model: string;
  maxTokens: number;
  temperature: number;
}
